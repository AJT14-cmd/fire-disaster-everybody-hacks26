import { Router } from "express";
import { db } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  broadcastImSafe,
  logAlertHistory,
  sendPushStub,
  sendSms
} from "../services/notificationService.js";
import { emitEvent } from "../services/websocketService.js";

const router = Router();

router.post("/send", requireAuth, async (req, res) => {
  const { userId, severity, message, sendSms: smsEnabled, sendPush } = req.body;
  if (userId && userId !== req.user.id && !req.user.roles?.includes("admin")) {
    return res.status(403).json({ error: "Cannot send alerts for another user." });
  }
  const targetUserId = userId ?? req.user.id;
  const userResult = await db.query(
    "SELECT emergency_contacts FROM users WHERE id = $1 LIMIT 1",
    [targetUserId]
  );
  if (userResult.rowCount === 0) {
    return res.status(404).json({ error: "Target user not found." });
  }
  const user = userResult.rowCount > 0 ? userResult.rows[0] : { emergency_contacts: [] };

  const channels = [];
  const outputs = {};

  if (smsEnabled && user?.emergency_contacts?.length) {
    channels.push("sms");
    outputs.sms = await Promise.all(
      user.emergency_contacts.map((contact) => sendSms(contact.phone, message))
    );
  }
  if (sendPush) {
    channels.push("push");
    outputs.push = await sendPushStub(targetUserId, { severity, message });
  }

  await logAlertHistory(targetUserId, { severity, message, channels, status: "sent" });
  emitEvent("alert.urgent", { userId: targetUserId, severity, message });

  return res.json({ ok: true, channels, outputs });
});

router.post("/im-safe", requireAuth, async (req, res) => {
  const results = await broadcastImSafe(req.user.id, req.body.note);
  return res.json({ ok: true, notifications: results });
});

export default router;
