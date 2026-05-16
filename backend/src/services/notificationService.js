import { db } from "../config/db.js";
import { twilioClient } from "../config/twilio.js";
import { env } from "../config/env.js";

export async function sendSms(phoneNumber, message) {
  if (!twilioClient || !env.twilioFrom) {
    return { status: "skipped", reason: "Twilio not configured" };
  }
  const sms = await twilioClient.messages.create({
    to: phoneNumber,
    from: env.twilioFrom,
    body: message
  });
  return { status: "sent", sid: sms.sid };
}

export async function sendPushStub(userId, payload) {
  // Placeholder for FCM server SDK integration.
  return { status: "queued", userId, payload };
}

export async function logAlertHistory(userId, alert) {
  await db.query(
    `
      INSERT INTO alerts (user_id, severity, message, channels, status, metadata)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb)
    `,
    [
      userId,
      alert.severity,
      alert.message,
      JSON.stringify(alert.channels ?? []),
      alert.status ?? "sent",
      JSON.stringify(alert.metadata ?? {})
    ]
  );
}

export async function broadcastImSafe(userId, note) {
  const user = await db.query("SELECT emergency_contacts FROM users WHERE id = $1 LIMIT 1", [userId]);
  if (user.rowCount === 0) return [];
  const contacts = user.rows[0].emergency_contacts ?? [];
  const message = `FirePath AI: User ${userId} marked safe. ${note ?? ""}`.trim();
  const results = await Promise.all(
    contacts.map((c) => sendSms(c.phone, message).catch((e) => ({ status: "failed", error: e.message })))
  );
  return results;
}
