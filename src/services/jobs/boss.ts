import { PgBoss } from "pg-boss";
import path from "path";
import * as fs from "fs";

// Reuse the same SSL CA the app's pg Pool uses (see services/db/index.ts).
const ca = fs
  .readFileSync(path.resolve(import.meta.dirname, "../../../ca.pem"))
  .toString();

let boss: PgBoss | undefined;

/**
 * The single pg-boss instance. Points at the same Postgres as the app but in
 * its own schema (default "pgboss"), so the durable queue lives beside our
 * Drizzle tables without colliding with them. Constructed lazily so importing a
 * job helper never spins up a connection until the worker actually starts.
 */
export const getBoss = (): PgBoss => {
  if (!boss) {
    boss = new PgBoss({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: true, ca },
      schema: process.env.PGBOSS_SCHEMA || "pgboss",
      // Cap pg-boss's own connection pool. It runs alongside the app's pg Pool
      // (and, in prod, in a separate worker process), so keep it small to stay
      // well under the database's connection limit.
      max: Number(process.env.PGBOSS_MAX_CONNECTIONS) || 3,
    });

    // pg-boss surfaces background (maintenance/connection) errors here. Log them
    // rather than letting them become unhandled — the queue keeps running.
    boss.on("error", (error: unknown) =>
      console.error("[pg-boss] error", error),
    );
  }

  return boss;
};
