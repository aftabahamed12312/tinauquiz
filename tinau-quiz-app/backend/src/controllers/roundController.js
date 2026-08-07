const Round = require("../models/Round");

// @desc    Create a round
// @route   POST /api/rounds
// @access  Private/Admin
const createRound = async (req, res) => {
  try {
    const { name, roundNumber, defaultTimerSeconds } = req.body;
    if (!name || roundNumber === undefined) {
      return res.status(400).json({ message: "Round name and roundNumber are required" });
    }
    const round = await Round.create({ name, roundNumber, defaultTimerSeconds });
    req.io?.emit("round:created", round);
    res.status(201).json(round);
  } catch (err) {
    res.status(500).json({ message: "Failed to create round", error: err.message });
  }
};

// @desc    List all rounds
// @route   GET /api/rounds
// @access  Public
const listRounds = async (req, res) => {
  try {
    const rounds = await Round.find().sort({ roundNumber: 1 });
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rounds", error: err.message });
  }
};

// @desc    Update a round (including status: PENDING/ACTIVE/COMPLETED)
// @route   PUT /api/rounds/:id
// @access  Private/Admin
const updateRound = async (req, res) => {
  try {
    const { name, roundNumber, status, defaultTimerSeconds } = req.body;
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).json({ message: "Round not found" });

    if (name !== undefined) round.name = name;
    if (roundNumber !== undefined) round.roundNumber = roundNumber;
    if (status !== undefined) round.status = status;
    if (defaultTimerSeconds !== undefined) round.defaultTimerSeconds = defaultTimerSeconds;

    await round.save();

    // If this round is now ACTIVE, broadcast so all panels can highlight it
    if (status === "ACTIVE") {
      req.io?.emit("round:activated", round);
    } else {
      req.io?.emit("round:updated", round);
    }

    res.json(round);
  } catch (err) {
    res.status(500).json({ message: "Failed to update round", error: err.message });
  }
};

// @desc    Delete a round
// @route   DELETE /api/rounds/:id
// @access  Private/Admin
const deleteRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).json({ message: "Round not found" });
    await round.deleteOne();
    req.io?.emit("round:deleted", { id: req.params.id });
    res.json({ message: "Round removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete round", error: err.message });
  }
};

module.exports = { createRound, listRounds, updateRound, deleteRound };
