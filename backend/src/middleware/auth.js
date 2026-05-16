import { auth, db } from "../config/firebase.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token." });
    }

    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      roles: userDoc.exists ? userDoc.data().roles ?? ["user"] : ["user"]
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireAdmin(req, res, next) {
  const roles = req.user?.roles ?? [];
  if (!roles.includes("admin")) {
    return res.status(403).json({ error: "Admin role required." });
  }
  return next();
}
