import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getFireIntelligence } from "../services/fireDataService.js";
import { getWildfirePrediction } from "../services/predictionService.js";
import { listSheltersNear } from "../services/shelterService.js";

const router = Router();

router.get("/intelligence", requireAuth, async (req, res) => {
  const lat = Number(req.query.lat ?? 34.0522);
  const lng = Number(req.query.lng ?? -118.2437);
  const intelligence = await getFireIntelligence(lat, lng);
  return res.json(intelligence);
});

router.post("/predict", requireAuth, async (req, res) => {
  const prediction = await getWildfirePrediction(req.body);
  return res.json(prediction);
});

router.get("/shelters", requireAuth, async (req, res) => {
  const lat = req.query.lat != null ? Number(req.query.lat) : null;
  const lng = req.query.lng != null ? Number(req.query.lng) : null;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 25)));
  const shelters = await listSheltersNear(lat, lng, limit);
  return res.json({ shelters });
});

export default router;
