const express = require("express");
const router = express.Router();
const { createRound, listRounds, updateRound, deleteRound } = require("../controllers/roundController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/", listRounds); // public so Board can show round name/status
router.post("/", protect, authorize("admin"), createRound);
router.put("/:id", protect, authorize("admin"), updateRound);
router.delete("/:id", protect, authorize("admin"), deleteRound);

module.exports = router;
