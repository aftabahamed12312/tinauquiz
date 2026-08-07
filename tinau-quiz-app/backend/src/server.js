require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedAdmin = require("./config/seedAdmin");
const registerQuizSocket = require("./sockets/quizSocket");

const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const topicRoutes = require("./routes/topicRoutes");
const roundRoutes = require("./routes/roundRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const localNetworkOriginRegexp = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === CLIENT_URL || localNetworkOriginRegexp.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS not allowed by server: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};

const io = new Server(server, {
  cors: corsOptions,
});

/* ---------------------- Middleware ---------------------- */
app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media (images/audio) statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Attach io to every request so controllers can broadcast: req.io.emit(...)
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ---------------------- Routes ---------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "tinau-quiz-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/questions", questionRoutes);
// Timer + session-reset endpoints, exposed under /api/quiz/*
app.use("/api/quiz", questionRoutes.timerRouter);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Centralized error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

/* ---------------------- Socket.io ---------------------- */
registerQuizSocket(io);

/* ---------------------- Startup ---------------------- */
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();
  server.listen(PORT, () => {
    console.log(`🏫 TINAU SCHOOL Quiz System backend running on port ${PORT}`);
    console.log(`🔗 Accepting client connections from ${CLIENT_URL}`);
  });
};

if (process.env.VERCEL) {
  module.exports = { app, server, io };
} else {
  start();
  module.exports = { app, server, io };
}
