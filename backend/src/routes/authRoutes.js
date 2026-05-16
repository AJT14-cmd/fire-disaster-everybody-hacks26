import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const existing = await db.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const created = await db.query(
    `
      INSERT INTO users (email, password_hash, display_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, display_name, roles
    `,
    [email, passwordHash, displayName ?? null]
  );
  const user = created.rows[0];
  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      roles: user.roles
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const found = await db.query(
    "SELECT id, email, display_name, roles, password_hash FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  if (found.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const row = found.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign({ sub: row.id, email: row.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return res.json({
    token,
    user: {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      roles: row.roles
    }
  });
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
