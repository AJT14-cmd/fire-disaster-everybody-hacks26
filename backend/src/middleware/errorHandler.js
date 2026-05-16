import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  return res.status(404).json({ error: "Endpoint not found." });
}

export function errorHandler(error, req, res, next) {
  logger.error("Unhandled error:", error);
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined
  });
}
