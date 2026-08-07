const House = require("../models/House");

// @desc    Create a house (e.g. Red, Blue, Green, Yellow)
// @route   POST /api/houses
// @access  Private/Admin
const createHouse = async (req, res) => {
  try {
    const { name, colorCode } = req.body;
    if (!name) return res.status(400).json({ message: "House name is required" });

    const existing = await House.findOne({ name });
    if (existing) return res.status(409).json({ message: "House already exists" });

    const house = await House.create({ name, colorCode });
    req.io?.emit("house:created", house);
    res.status(201).json(house);
  } catch (err) {
    res.status(500).json({ message: "Failed to create house", error: err.message });
  }
};

// @desc    List all houses (sorted by score desc for leaderboard use)
// @route   GET /api/houses
// @access  Public (used by Board dashboard)
const listHouses = async (req, res) => {
  try {
    const houses = await House.find()
      .populate("leaders", "name email")
      .sort({ score: -1 });
    res.json(houses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch houses", error: err.message });
  }
};

// @desc    Update a house (name/color/leaders)
// @route   PUT /api/houses/:id
// @access  Private/Admin
const updateHouse = async (req, res) => {
  try {
    const { name, colorCode, leaders } = req.body;
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: "House not found" });

    if (name !== undefined) house.name = name;
    if (colorCode !== undefined) house.colorCode = colorCode;
    if (leaders !== undefined) house.leaders = leaders;

    await house.save();
    req.io?.emit("house:updated", house);
    res.json(house);
  } catch (err) {
    res.status(500).json({ message: "Failed to update house", error: err.message });
  }
};

// @desc    Delete a house
// @route   DELETE /api/houses/:id
// @access  Private/Admin
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: "House not found" });
    await house.deleteOne();
    req.io?.emit("house:deleted", { id: req.params.id });
    res.json({ message: "House removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete house", error: err.message });
  }
};

// @desc    Award or deduct points for a house (Host action)
// @route   PATCH /api/houses/:id/score
// @access  Private/Admin,Host
const adjustScore = async (req, res) => {
  try {
    const { delta } = req.body; // e.g. +10 or -5
    if (typeof delta !== "number") {
      return res.status(400).json({ message: "delta must be a number" });
    }

    const house = await House.findByIdAndUpdate(
      req.params.id,
      { $inc: { score: delta } },
      { new: true }
    );
    if (!house) return res.status(404).json({ message: "House not found" });

    req.io?.emit("score:updated", { houseId: house._id, score: house.score });
    res.json(house);
  } catch (err) {
    res.status(500).json({ message: "Failed to adjust score", error: err.message });
  }
};

// @desc    Set which house currently has the active turn
// @route   PATCH /api/houses/:id/active-turn
// @access  Private/Admin,Host
const setActiveTurn = async (req, res) => {
  try {
    // Clear active turn on all houses, then set it on the chosen one
    await House.updateMany({}, { isActiveTurn: false });
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { isActiveTurn: true },
      { new: true }
    );
    if (!house) return res.status(404).json({ message: "House not found" });

    req.io?.emit("house:turnChanged", { houseId: house._id });
    res.json(house);
  } catch (err) {
    res.status(500).json({ message: "Failed to set active turn", error: err.message });
  }
};

// @desc    Reset all house scores to 0 (Admin session reset)
// @route   POST /api/houses/reset-scores
// @access  Private/Admin
const resetScores = async (req, res) => {
  try {
    await House.updateMany({}, { score: 0, isActiveTurn: false });
    const houses = await House.find();
    req.io?.emit("scores:reset", houses);
    res.json({ message: "All scores reset", houses });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset scores", error: err.message });
  }
};

module.exports = {
  createHouse,
  listHouses,
  updateHouse,
  deleteHouse,
  adjustScore,
  setActiveTurn,
  resetScores,
};
