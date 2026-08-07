const express = require("express");
const router = express.Router();
const { createTopic, listTopics, updateTopic, deleteTopic } = require("../controllers/topicController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/", protect, listTopics);
router.post("/", protect, authorize("admin"), createTopic);
router.put("/:id", protect, authorize("admin"), updateTopic);
router.delete("/:id", protect, authorize("admin"), deleteTopic);

module.exports = router;
