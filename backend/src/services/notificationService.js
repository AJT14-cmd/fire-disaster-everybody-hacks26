import { db } from "../config/firebase.js";
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
  await db.collection("alerts").add({
    userId,
    ...alert,
    createdAt: new Date().toISOString()
  });
}

export async function broadcastImSafe(userId, note) {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return [];
  const contacts = userDoc.data().emergencyContacts ?? [];
  const message = `FirePath AI: User ${userId} marked safe. ${note ?? ""}`.trim();
  const results = await Promise.all(
    contacts.map((c) => sendSms(c.phone, message).catch((e) => ({ status: "failed", error: e.message })))
  );
  return results;
}
