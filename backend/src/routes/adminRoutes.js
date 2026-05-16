import { Router } from "express";
import { db } from "../config/db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  const [reportsCount, shelters] = await Promise.all([
    db.query("SELECT COUNT(*)::int AS count FROM community_reports"),
    db.query(
      "SELECT name, capacity, current_occupancy FROM shelters ORDER BY updated_at DESC LIMIT 100"
    )
  ]);

  const shelterOccupancy = shelters.rows.map((s) => ({
    name: s.name,
    occupancyRate: s.capacity ? Number((s.current_occupancy / s.capacity).toFixed(3)) : 0
  }));

  return res.json({
    metrics: {
      communityReportsCount: reportsCount.rows[0].count,
      sheltersTracked: shelters.rows.length
    },
    shelterOccupancy
  });
});

export default router;
