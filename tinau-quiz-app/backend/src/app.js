const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const topicRoutes = require("./routes/topicRoutes");
const roundRoutes = require("./routes/roundRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const vercelOriginRegexp = /^https:\/\/([a-z0-9-]+\.)?vercel\.app$/;
const localNetworkOriginRegexp = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = new Set([
      CLIENT_URL,
      VERCEL_URL,
    ].filter(Boolean));

    if (allowedOrigins.has(origin) || vercelOriginRegexp.test(origin) || localNetworkOriginRegexp.test(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS not allowed by server: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.locals.corsOptions = corsOptions;
app.locals.io = { emit: () => {} };

app.use((req, res, next) => {
  req.io = app.locals.io;
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "tinau-quiz-backend", time: new Date().toISOString() });
});

const seedRoutes = require("./routes/seedRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", questionRoutes.timerRouter);
app.use("/api", seedRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
