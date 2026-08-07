const mongoose = require("mongoose");

/**
 * Establishes connection to MongoDB.
 * Retries a few times on startup since in Docker Compose the app
 * container can boot before the mongo container is ready to accept connections.
 */
const connectDB = async (retries = 8, delayMs = 3000) => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/tinau_quiz";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log(`✅ MongoDB connected: ${uri}`);
      return;
    } catch (err) {
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt === retries) {
        console.error("Could not connect to MongoDB. Exiting.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = connectDB;
