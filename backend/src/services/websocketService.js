import { WebSocketServer } from "ws";
import { logger } from "../utils/logger.js";

let wss;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "welcome", message: "Connected to FirePath live channel." }));

    socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "subscribe.region") {
          socket.send(JSON.stringify({ type: "subscribed", region: msg.payload }));
        }
      } catch (error) {
        logger.warn("Invalid websocket payload:", error.message);
      }
    });
  });

  logger.info("WebSocket server initialized");
}

export function emitEvent(type, payload) {
  if (!wss) return;
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}
