import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  const [alertsSnapshot, reportsSnapshot, sheltersSnapshot] = await Promise.all([
    db.collection("alerts").get(),
    db.collection("communityReports").get(),
    db.collection("shelters").get()
  ]);

  const shelterOccupancy = sheltersSnapshot.docs.map((doc) => doc.data()).map((s) => ({
    name: s.name,
    occupancyRate: s.capacity ? Number((s.currentOccupancy / s.capacity).toFixed(3)) : 0
  }));

  return res.json({
    metrics: {
      alertsCount: alertsSnapshot.size,
      communityReportsCount: reportsSnapshot.size,
      sheltersTracked: sheltersSnapshot.size
    },
    shelterOccupancy
  });
});

export default router;
