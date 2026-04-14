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
});

export const db = drizzle(client, { schema: { ...schema, ...relations } });

export * from "./schemas/index.js";
export * from "./queries/index.js";
