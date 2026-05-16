import admin from "firebase-admin";
import { env } from "./env.js";

if (!admin.apps.length) {
  if (env.firebaseClientEmail && env.firebasePrivateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey
      })
    });
  } else {
    admin.initializeApp({ projectId: env.firebaseProjectId });
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
