import { Router } from "express";
import { db } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/report", requireAuth, async (req, res) => {
  const inserted = await db.query(
    `
      INSERT INTO community_reports (
        user_id, lat, lng, type, description, image_url, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, user_id, lat, lng, type, description, image_url, verification_status, created_at
    `,
    [
      req.user.id,
      req.body.lat,
      req.body.lng,
      req.body.type,
      req.body.description ?? "",
      req.body.imageUrl ?? null
    ]
  );
  const row = inserted.rows[0];
  return res.status(201).json({
    id: row.id,
    userId: row.user_id,
    lat: row.lat,
    lng: row.lng,
    type: row.type,
    description: row.description,
    imageUrl: row.image_url,
    verificationStatus: row.verification_status,
    createdAt: row.created_at
  });
});

export default router;
