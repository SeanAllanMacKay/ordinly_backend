import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schemas/index.js";
import * as relations from "./relations/index.js";
import * as fs from "fs";

const client = new Pool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  ssl: {
    rejectUnauthorized: true,
    ca: fs
      .readFileSync(path.resolve(import.meta.dirname, "../../../ca.pem"))
      .toString(),
  },
  // The hosted dev plan caps max_connections at 15 (3 reserved for superuser,
  // ~6 consumed by Aiven's own background workers), and pg-boss runs its own
  // pool alongside this one. Without a cap, node-postgres defaults to 10, which
  // — combined with pg-boss — exhausts the ceiling and makes pg-boss's pollers
  // time out acquiring a connection. Keep the app pool small to stay within
  // budget. Override via DB_MAX_CONNECTIONS in environments with a higher limit.
  max: Number(process.env.DB_MAX_CONNECTIONS) || 5,
});

export const db = drizzle(client, { schema: { ...schema, ...relations } });

export * from "./schemas/index.js";
export * from "./queries/index.js";
