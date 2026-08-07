const Topic = require("../models/Topic");

// @desc    Create a topic under a round
// @route   POST /api/topics
// @access  Private/Admin
const createTopic = async (req, res) => {
  try {
    const { name, description, round } = req.body;
    if (!name || !round) {
      return res.status(400).json({ message: "Topic name and round are required" });
    }
    const topic = await Topic.create({ name, description, round });
    req.io?.emit("topic:created", topic);
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ message: "Failed to create topic", error: err.message });
  }
};

// @desc    List topics (optionally filtered by round)
// @route   GET /api/topics?round=<id>
// @access  Public
const listTopics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.round) filter.round = req.query.round;
    const topics = await Topic.find(filter).populate("round", "name roundNumber");
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch topics", error: err.message });
  }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private/Admin
const updateTopic = async (req, res) => {
  try {
    const { name, description, round } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (round !== undefined) topic.round = round;

    await topic.save();
    req.io?.emit("topic:updated", topic);
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: "Failed to update topic", error: err.message });
  }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Private/Admin
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    await topic.deleteOne();
    req.io?.emit("topic:deleted", { id: req.params.id });
    res.json({ message: "Topic removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete topic", error: err.message });
  }
};

module.exports = { createTopic, listTopics, updateTopic, deleteTopic };
