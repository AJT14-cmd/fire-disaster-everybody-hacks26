import { Router } from "express";
import { db } from "../config/firebase.js";
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
  const targetUserId = userId ?? req.user.uid;
  const userDoc = await db.collection("users").doc(targetUserId).get();
  const user = userDoc.exists ? userDoc.data() : {};

  const channels = [];
  const outputs = {};

  if (smsEnabled && user?.emergencyContacts?.length) {
    channels.push("sms");
    outputs.sms = await Promise.all(
      user.emergencyContacts.map((contact) => sendSms(contact.phone, message))
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
  const results = await broadcastImSafe(req.user.uid, req.body.note);
  return res.json({ ok: true, notifications: results });
});

export default router;
