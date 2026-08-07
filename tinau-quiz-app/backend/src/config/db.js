const mongoose = require("mongoose");

let cached = global.__mongoCache;
if (!cached) {
  cached = global.__mongoCache = { conn: null, promise: null };
}

/**
 * Establishes connection to MongoDB.
 * Retries a few times on startup since in Docker Compose the app
 * container can boot before the mongo container is ready to accept connections.
 */
const connectDB = async (retries = 8, delayMs = 3000) => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/tinau_quiz";

  if (!cached.promise) {
    cached.promise = (async () => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
          console.log(`✅ MongoDB connected: ${uri}`);
          cached.conn = conn;
          return conn;
        } catch (err) {
          console.error(
            `❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
          );
          if (attempt === retries) {
            throw err;
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
