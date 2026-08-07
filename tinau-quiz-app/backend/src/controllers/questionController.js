const Question = require("../models/Question");

// @desc    Create a question (Question Bank entry)
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
  try {
    const { round, topic, questionText, answerText, mediaType, points, timerSeconds, mediaUrlExternal } = req.body;

    if (!round || !topic || !questionText || !answerText) {
      return res.status(400).json({ message: "round, topic, questionText, and answerText are required" });
    }

    // Media can come from an uploaded file (req.file) or an external URL (mediaUrlExternal)
    let mediaUrl = null;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    } else if (mediaUrlExternal) {
      mediaUrl = mediaUrlExternal;
    }

    const question = await Question.create({
      round,
      topic,
      questionText,
      answerText,
      mediaType: mediaType || "text",
      mediaUrl,
      points: points || 10,
      timerSeconds: timerSeconds || 30,
    });

    req.io?.emit("question:created", question);
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: "Failed to create question", error: err.message });
  }
};

// @desc    List questions (optionally filter by round/topic/status)
// @route   GET /api/questions
// @access  Private (Admin/Host/House Leader see different subsets client-side)
const listQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.round) filter.round = req.query.round;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.status) filter.status = req.query.status;

    const questions = await Question.find(filter)
      .populate("round", "name roundNumber")
      .populate("topic", "name")
      .populate("assignedHouse", "name colorCode")
      .populate("wonByHouse", "name colorCode")
      .sort({ createdAt: 1 });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch questions", error: err.message });
  }
};

// @desc    Get single question by id
// @route   GET /api/questions/:id
// @access  Private
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("round", "name roundNumber")
      .populate("topic", "name")
      .populate("assignedHouse", "name colorCode");
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch question", error: err.message });
  }
};

// @desc    Update a question's content (Admin edits question bank)
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const fields = ["questionText", "answerText", "mediaType", "points", "timerSeconds", "round", "topic"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) question[f] = req.body[f];
    });

    if (req.file) {
      question.mediaUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.mediaUrlExternal) {
      question.mediaUrl = req.body.mediaUrlExternal;
    }

    await question.save();
    req.io?.emit("question:updated", question);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Failed to update question", error: err.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    await question.deleteOne();
    req.io?.emit("question:deleted", { id: req.params.id });
    res.json({ message: "Question removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete question", error: err.message });
  }
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
