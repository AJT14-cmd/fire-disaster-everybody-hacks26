import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../config/db.js";
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
  const snapshot = await db.query(
    `
      SELECT id, name, lat, lng, capacity, current_occupancy, pet_friendly, medical_support, updated_at
      FROM shelters
      ORDER BY updated_at DESC
      LIMIT 100
    `
  );
  const shelters = snapshot.rows.map((row) => ({
    id: row.id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    capacity: row.capacity,
    currentOccupancy: row.current_occupancy,
    petFriendly: row.pet_friendly,
    medicalSupport: row.medical_support,
    updatedAt: row.updated_at
  }));
  return res.json({ shelters });
});

export default router;
