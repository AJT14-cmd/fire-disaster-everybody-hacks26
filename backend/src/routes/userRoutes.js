import { Router } from "express";
import { db } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { encryptJson } from "../services/encryptionService.js";

const router = Router();

router.put("/profile", requireAuth, async (req, res) => {
  const { displayName, emergencyContacts = [], evacuationPreferences = {}, homeLocation } = req.body;
  await db.query(
    `
      UPDATE users
      SET
        display_name = COALESCE($2, display_name),
        emergency_contacts = $3::jsonb,
        evacuation_preferences = $4::jsonb,
        home_location_encrypted = COALESCE($5, home_location_encrypted),
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      req.user.id,
      displayName ?? null,
      JSON.stringify(emergencyContacts),
      JSON.stringify(evacuationPreferences),
      homeLocation ? encryptJson(homeLocation) : null
    ]
  );
  return res.json({ ok: true });
});

router.get("/alerts/history", requireAuth, async (req, res) => {
  const alerts = await db.query(
    `
      SELECT id, severity, message, channels, status, metadata, created_at
      FROM alerts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
    [req.user.id]
  );
  return res.json({
    alerts: alerts.rows.map((row) => ({
      id: row.id,
      severity: row.severity,
      message: row.message,
      channels: row.channels,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at
    }))
  });
});

export default router;
