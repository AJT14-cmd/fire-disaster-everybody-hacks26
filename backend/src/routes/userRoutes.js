import { Router } from "express";
import { db } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { encryptJson } from "../services/encryptionService.js";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const result = await db.query(
    `
      SELECT display_name, evacuation_preferences
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found." });
  }
  const row = result.rows[0];
  const prefs = row.evacuation_preferences ?? {};
  return res.json({
    displayName: row.display_name,
    evacuationPreferences: prefs,
    alertPhone: prefs.alertPhone ?? null
  });
});

router.put("/profile", requireAuth, async (req, res) => {
  const { displayName, evacuationPreferences, homeLocation, alertPhone } = req.body;

  let mergedPreferences = evacuationPreferences;
  if (alertPhone !== undefined || evacuationPreferences) {
    const current = await db.query(
      "SELECT evacuation_preferences FROM users WHERE id = $1 LIMIT 1",
      [req.user.id]
    );
    const existing = current.rows[0]?.evacuation_preferences ?? {};
    mergedPreferences = {
      ...existing,
      ...(evacuationPreferences ?? {}),
      ...(alertPhone !== undefined
        ? { alertPhone: String(alertPhone).trim() || null, alertSmsEnabled: false }
        : {})
    };
  }

  await db.query(
    `
      UPDATE users
      SET
        display_name = COALESCE($2, display_name),
        evacuation_preferences = COALESCE($3::jsonb, evacuation_preferences),
        home_location_encrypted = COALESCE($4, home_location_encrypted),
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      req.user.id,
      displayName ?? null,
      mergedPreferences ? JSON.stringify(mergedPreferences) : null,
      homeLocation ? encryptJson(homeLocation) : null
    ]
  );
  return res.json({
    ok: true,
    alertPhone: mergedPreferences?.alertPhone ?? null,
    message: "Profile saved. Mobile SMS alerts are not active yet."
  });
});

export default router;
