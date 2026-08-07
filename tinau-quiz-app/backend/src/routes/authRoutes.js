const express = require("express");
const router = express.Router();
const { login, getMe, createUser, listUsers, deleteUser } = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/login", login);
router.get("/me", protect, getMe);

// Admin-only user management (creating Host / House Leader accounts)
router.post("/users", protect, authorize("admin"), createUser);
router.get("/users", protect, authorize("admin"), listUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
