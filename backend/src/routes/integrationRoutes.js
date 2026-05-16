import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/wearables/heartbeat", requireAuth, async (req, res) => {
  // Readiness endpoint for Apple Watch / Wear OS telemetry ingestion.
  return res.status(202).json({ ok: true, status: "accepted", source: "wearable" });
});

router.post("/drone/camera-frame", requireAuth, async (req, res) => {
  // Readiness endpoint for future drone/camera smoke detection pipelines.
  return res.status(202).json({ ok: true, status: "accepted", source: "drone-camera" });
});

export default router;
