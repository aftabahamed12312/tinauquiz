const Question = require("../models/Question");
const House = require("../models/House");

/**
 * quizController holds the core game-flow business logic described in the
 * spec's "Logical Rules & Business Logic" section:
 *   AVAILABLE -> ASKED -> REVEALED / PASSED / COMPLETED
 * Every mutation here broadcasts a socket event so the Public Board,
 * Host Console, and House Leader panels stay in sub-100ms sync.
 */

// @desc    House Leader picks / Host asks an AVAILABLE question -> ASKED
// @route   PATCH /api/quiz/questions/:id/ask
// @access  Private/Admin,Host,House Leader (house leader can only pick on their turn)
const askQuestion = async (req, res) => {
  try {
    const { houseId } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (question.status !== "AVAILABLE") {
      return res.status(409).json({ message: `Question is already ${question.status} and cannot be asked again` });
    }

    question.status = "ASKED";
    question.assignedHouse = houseId || null;
    if (houseId) question.passHistory.push(houseId);
    await question.save();

    const populated = await question.populate([
      { path: "assignedHouse", select: "name colorCode" },
      { path: "topic", select: "name" },
    ]);

    req.io?.emit("question:asked", populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to ask question", error: err.message });
  }
};

// @desc    Host reveals the answer -> REVEALED (locks the question)
// @route   PATCH /api/quiz/questions/:id/reveal
// @access  Private/Admin,Host
const revealAnswer = async (req, res) => {
  try {
    const { winningHouseId } = req.body; // optional: house that answered correctly
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (!["ASKED", "PASSED"].includes(question.status)) {
      return res.status(409).json({ message: `Cannot reveal a question in status ${question.status}` });
    }

    question.status = "REVEALED";
    if (winningHouseId) {
      question.wonByHouse = winningHouseId;
      // Award points automatically to the winning house
      await House.findByIdAndUpdate(winningHouseId, { $inc: { score: question.points } });
    }
    await question.save();

    const populated = await question.populate([
      { path: "assignedHouse", select: "name colorCode" },
      { path: "wonByHouse", select: "name colorCode" },
    ]);

    req.io?.emit("question:revealed", populated);
    if (winningHouseId) {
      const houses = await House.find().sort({ score: -1 });
      req.io?.emit("scores:sync", houses);
    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to reveal answer", error: err.message });
  }
};

// @desc    Host passes an unanswered / timed-out question to the next house
// @route   PATCH /api/quiz/questions/:id/pass
// @access  Private/Admin,Host
const passQuestion = async (req, res) => {
  try {
    const { nextHouseId } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (!["ASKED", "PASSED"].includes(question.status)) {
      return res.status(409).json({ message: `Cannot pass a question in status ${question.status}` });
    }

    question.status = nextHouseId ? "ASKED" : "PASSED";
    question.assignedHouse = nextHouseId || null;
    if (nextHouseId) question.passHistory.push(nextHouseId);
    await question.save();

    const populated = await question.populate([
      { path: "assignedHouse", select: "name colorCode" },
      { path: "topic", select: "name" },
    ]);

    req.io?.emit("question:passed", populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to pass question", error: err.message });
  }
};

// @desc    Mark a question fully COMPLETED (closes it out after reveal/pass chain ends)
// @route   PATCH /api/quiz/questions/:id/complete
// @access  Private/Admin,Host
const completeQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.status = "COMPLETED";
    await question.save();

    req.io?.emit("question:completed", { id: question._id });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Failed to complete question", error: err.message });
  }
};

// @desc    Host starts a countdown timer for the current question
// @route   POST /api/quiz/timer/start
// @access  Private/Admin,Host
const startTimer = async (req, res) => {
  try {
    const { questionId, durationSeconds } = req.body;
    if (!questionId || !durationSeconds) {
      return res.status(400).json({ message: "questionId and durationSeconds are required" });
    }

    const endsAt = Date.now() + durationSeconds * 1000;
    req.io?.emit("timer:started", { questionId, durationSeconds, endsAt });
    res.json({ questionId, durationSeconds, endsAt });
  } catch (err) {
    res.status(500).json({ message: "Failed to start timer", error: err.message });
  }
};

// @desc    Broadcast "TIME IS UP!" for the current question
// @route   POST /api/quiz/timer/expire
// @access  Private/Admin,Host
const expireTimer = async (req, res) => {
  try {
    const { questionId } = req.body;
    req.io?.emit("timer:expired", { questionId });
    res.json({ message: "Time is up broadcast sent", questionId });
  } catch (err) {
    res.status(500).json({ message: "Failed to broadcast timer expiry", error: err.message });
  }
};

// @desc    Host cancels/stops the running timer (e.g. answer given early)
// @route   POST /api/quiz/timer/stop
// @access  Private/Admin,Host
const stopTimer = async (req, res) => {
  try {
    const { questionId } = req.body;
    req.io?.emit("timer:stopped", { questionId });
    res.json({ message: "Timer stopped", questionId });
  } catch (err) {
    res.status(500).json({ message: "Failed to stop timer", error: err.message });
  }
};

// @desc    Admin master reset: clears all question states back to AVAILABLE
// @route   POST /api/quiz/session/reset
// @access  Private/Admin
const resetSession = async (req, res) => {
  try {
    await Question.updateMany(
      {},
      {
        status: "AVAILABLE",
        assignedHouse: null,
        wonByHouse: null,
        passHistory: [],
      }
    );
    await House.updateMany({}, { score: 0, isActiveTurn: false });

    req.io?.emit("session:reset");
    res.json({ message: "Quiz session fully reset" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset session", error: err.message });
  }
};

module.exports = {
  askQuestion,
  revealAnswer,
  passQuestion,
  completeQuestion,
  startTimer,
  expireTimer,
  stopTimer,
  resetSession,
};
