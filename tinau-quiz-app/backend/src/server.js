require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedAdmin = require("./config/seedAdmin");
const registerQuizSocket = require("./sockets/quizSocket");
const app = require("./app");

const server = http.createServer(app);
const io = new Server(server, {
  cors: app.locals.corsOptions,
});

app.locals.io = io;

registerQuizSocket(io);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();
  server.listen(PORT, () => {
    console.log(`🏫 TINAU SCHOOL Quiz System backend running on port ${PORT}`);
    console.log(`🔗 Accepting client connections from ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  });
};

if (require.main === module) {
  start();
}

module.exports = { app, server, io };
