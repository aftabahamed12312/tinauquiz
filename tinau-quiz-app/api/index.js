const connectDB = require("../backend/src/config/db");
const app = require("../backend/src/app");

connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

module.exports = app;
