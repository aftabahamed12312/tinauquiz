const express = require("express");
const router = express.Router();
const {
  createHouse,
  listHouses,
  updateHouse,
  deleteHouse,
  adjustScore,
  setActiveTurn,
  resetScores,
} = require("../controllers/houseController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public: Board dashboard reads the leaderboard without auth
router.get("/", listHouses);

router.post("/", protect, authorize("admin"), createHouse);
router.put("/:id", protect, authorize("admin"), updateHouse);
router.delete("/:id", protect, authorize("admin"), deleteHouse);
router.post("/reset-scores", protect, authorize("admin"), resetScores);

router.patch("/:id/score", protect, authorize("admin", "host"), adjustScore);
router.patch("/:id/active-turn", protect, authorize("admin", "host"), setActiveTurn);

module.exports = router;
