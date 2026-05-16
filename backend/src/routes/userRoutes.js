import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";
import { encryptJson } from "../services/encryptionService.js";

const router = Router();

router.put("/profile", requireAuth, async (req, res) => {
  const { displayName, emergencyContacts = [], evacuationPreferences = {}, homeLocation } = req.body;
  await db
    .collection("users")
    .doc(req.user.uid)
    .set(
      {
        email: req.user.email,
        displayName,
        emergencyContacts,
        evacuationPreferences,
        homeLocationEncrypted: homeLocation ? encryptJson(homeLocation) : undefined,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  return res.json({ ok: true });
});

router.get("/alerts/history", requireAuth, async (req, res) => {
  const snapshot = await db
    .collection("alerts")
    .where("userId", "==", req.user.uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return res.json({ alerts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
});

export default router;
