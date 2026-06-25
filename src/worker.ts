import { startWorker, stopJobs } from "./services/jobs/index.js";

// Standalone worker entrypoint for production (deploy as a background worker on
// the managed platform). Runs the pg-boss queue — workers + cron schedules — but
// no HTTP server. Locally, `yarn dev` boots the same worker in-process instead
// (see server.ts), so you don't need to run this separately during development.

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT ERROR", error);
});

const shutdown = async (signal: string) => {
  console.log(`[worker] ${signal} received — shutting down`);
  try {
    await stopJobs();
  } finally {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startWorker().catch((error) => {
  console.error("[worker] failed to start", error);
  process.exit(1);
});
