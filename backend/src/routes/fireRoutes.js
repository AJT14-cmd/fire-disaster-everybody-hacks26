import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../config/firebase.js";
import { getFireIntelligence } from "../services/fireDataService.js";
import { getWildfirePrediction } from "../services/predictionService.js";

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
  const snapshot = await db.collection("shelters").limit(100).get();
  const shelters = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ shelters });
});

export default router;
