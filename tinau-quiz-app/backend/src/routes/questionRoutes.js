const express = require("express");
const router = express.Router();
const {
  createQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const {
  askQuestion,
  revealAnswer,
  passQuestion,
  completeQuestion,
  startTimer,
  expireTimer,
  stopTimer,
  resetSession,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

/* ---------- Question Bank (Admin CRUD) ---------- */
router.get("/", protect, listQuestions);
router.get("/:id", protect, getQuestion);
router.post("/", protect, authorize("admin"), upload.single("media"), createQuestion);
router.put("/:id", protect, authorize("admin"), upload.single("media"), updateQuestion);
router.delete("/:id", protect, authorize("admin"), deleteQuestion);

/* ---------- Live Game Flow (Host / House Leader) ---------- */
router.patch("/:id/ask", protect, authorize("admin", "host", "house_leader"), askQuestion);
router.patch("/:id/reveal", protect, authorize("admin", "host"), revealAnswer);
router.patch("/:id/pass", protect, authorize("admin", "host"), passQuestion);
router.patch("/:id/complete", protect, authorize("admin", "host"), completeQuestion);

module.exports = router;

/* ---------- Timer & Session controls are mounted separately in server.js
   under /api/quiz to keep this file focused on question resources. ---------- */
module.exports.timerRouter = express.Router();
module.exports.timerRouter.post("/timer/start", protect, authorize("admin", "host"), startTimer);
module.exports.timerRouter.post("/timer/expire", protect, authorize("admin", "host"), expireTimer);
module.exports.timerRouter.post("/timer/stop", protect, authorize("admin", "host"), stopTimer);
module.exports.timerRouter.post("/session/reset", protect, authorize("admin"), resetSession);
