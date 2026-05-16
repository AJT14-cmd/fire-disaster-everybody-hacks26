import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { env } from "../config/env.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token." });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const userResult = await db.query("SELECT id, email, roles FROM users WHERE id = $1 LIMIT 1", [
      decoded.sub
    ]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: "User does not exist." });
    }
    const user = userResult.rows[0];
    req.user = { id: user.id, email: user.email, roles: user.roles ?? ["user"] };
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
