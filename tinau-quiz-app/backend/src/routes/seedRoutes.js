const express = require("express");
const router = express.Router();
const { seedAdmin } = require("../controllers/seedController");

router.post("/seed-admin", seedAdmin);

module.exports = router;
