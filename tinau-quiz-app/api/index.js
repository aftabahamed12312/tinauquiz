const connectDB = require("../backend/src/config/db");
const seedAdmin = require("../backend/src/config/seedAdmin");
const app = require("../backend/src/app");

const initializeServerless = async () => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (err) {
    console.error("Serverless startup error:", err);
  }
};

initializeServerless();

module.exports = app;
