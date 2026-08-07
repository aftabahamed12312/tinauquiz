const connectDB = require("../backend/src/config/db");
const seedAdmin = require("../backend/src/config/seedAdmin");
const app = require("../backend/src/app");

let serverlessReadyPromise = null;

const initializeServerless = async () => {
  if (!serverlessReadyPromise) {
    serverlessReadyPromise = (async () => {
      try {
        await connectDB();
        await seedAdmin();
        console.log("✅ Vercel serverless backend initialized");
      } catch (err) {
        console.error("❌ Vercel serverless startup error:", err.message || err);
        throw err;
      }
    })();
  }
  return serverlessReadyPromise;
};

initializeServerless();

app.use(async (req, res, next) => {
  try {
    await initializeServerless();
    next();
  } catch (err) {
    res.status(500).json({
      message: "Server is not ready, database initialization failed",
      error: err.message || "Database initialization error",
    });
  }
});

module.exports = app;
