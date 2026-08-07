import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/";

// A single shared socket instance for the whole app.
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

/**
 * Joins a named panel room so the server can (eventually) target
 * broadcasts. Call once when a dashboard page mounts.
 */
export const joinPanel = (panel, houseId = null) => {
  socket.emit("panel:join", { panel, houseId });
};

export default socket;
