import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/report", requireAuth, async (req, res) => {
  const report = {
    userId: req.user.uid,
    lat: req.body.lat,
    lng: req.body.lng,
    type: req.body.type,
    description: req.body.description ?? "",
    imageUrl: req.body.imageUrl ?? null,
    verificationStatus: "pending",
    createdAt: new Date().toISOString()
  };
  const ref = await db.collection("communityReports").add(report);
  return res.status(201).json({ id: ref.id, ...report });
});

export default router;
