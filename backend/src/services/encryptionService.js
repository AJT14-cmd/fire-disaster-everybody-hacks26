import crypto from "crypto";
import { env } from "../config/env.js";

const key = Buffer.from(env.locationEncryptionKey, "utf8").subarray(0, 32);

export function encryptJson(payload) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptJson(cipherText) {
  const [ivHex, encryptedHex] = cipherText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString("utf8");
  return JSON.parse(decrypted);
}
