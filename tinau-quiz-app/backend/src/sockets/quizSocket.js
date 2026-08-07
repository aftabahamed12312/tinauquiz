/**
 * quizSocket.js
 *
 * Most real-time events in this app are emitted directly from the REST
 * controllers (via req.io, attached in server.js) right after a successful
 * DB mutation — that keeps a single source of truth (MongoDB) and avoids
 * sockets drifting out of sync with the database.
 *
 * This file handles the *connection lifecycle* itself: room subscriptions
 * per panel type, presence tracking, and lightweight ephemeral events that
 * don't need to be persisted (e.g. host cursor/typing indicators, board
 * "ping" health checks).
 */

const registerQuizSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Each panel joins a named room so we *could* target broadcasts later
    // (currently most events are global io.emit, but rooms give us room
    // to scale to multi-competition / multi-venue deployments).
    socket.on("panel:join", ({ panel, houseId }) => {
      const validPanels = ["board", "admin", "host", "house"];
      if (!validPanels.includes(panel)) return;

      socket.join(panel);
      if (panel === "house" && houseId) {
        socket.join(`house:${houseId}`);
      }
      socket.emit("panel:joined", { panel, houseId: houseId || null });
    });

    // Simple latency/health check used by the Board dashboard to show a
    // "live" connection indicator.
    socket.on("ping:check", () => {
      socket.emit("pong:check", { serverTime: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
    });
  });
};

module.exports = registerQuizSocket;
