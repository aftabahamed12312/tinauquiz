const mongoose = require("mongoose");

let cached = global.__mongoCache;
if (!cached) {
  cached = global.__mongoCache = { conn: null, promise: null };
}

/**
 * Establishes connection to MongoDB.
 * Uses a global cache so serverless functions reuse the same client across invocations.
 */
const connectDB = async (retries = 3, delayMs = 2000) => {
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
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 5,
            family: 4,
          });

          mongoose.connection.on("connected", () => {
            console.log(`✅ MongoDB connected: ${uri}`);
          });

          mongoose.connection.on("error", (err) => {
            console.error(`❌ MongoDB connection error: ${err.message}`);
          });

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
