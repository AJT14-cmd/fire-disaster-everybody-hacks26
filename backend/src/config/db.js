import { Pool } from "pg";
import { env } from "./env.js";

export const db = new Pool({
  connectionString: env.databaseUrl
});

export async function ensureDatabaseSchema() {
  await db.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      roles TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
      emergency_contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
      evacuation_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
      home_location_encrypted TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      channels JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS fire_snapshots (
      region_key TEXT PRIMARY KEY,
      snapshot JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS shelters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 0,
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      pet_friendly BOOLEAN NOT NULL DEFAULT false,
      medical_support BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS community_reports (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
