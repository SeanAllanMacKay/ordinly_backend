import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import routers from "./routers/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import ngrok from "@ngrok/ngrok";
import { startWorker, startQueueClient } from "./services/jobs/index.js";

const API_PORT = process.env.API_PORT;
const FE_ORIGIN = process.env.FE_ORIGIN;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const NGROK_DOMAIN = process.env.NGROK_DOMAIN;

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT ERROR", error);
});

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      `http://${FE_ORIGIN}`,
      `https://${FE_ORIGIN}`,
      process.env.NODE_ENV === "development" && `http://${NGROK_DOMAIN}`,
    ],
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(COOKIE_SECRET));
app.use("/api", routers);

const server = createServer(app);

server.listen(API_PORT, () => {
  console.log(`Server online: connected to port ${API_PORT}`);
  console.log(`Accepting requests from ${FE_ORIGIN}`);
});

// Background jobs (reminders, scheduled emails). In development — or anywhere
// RUN_WORKER_INLINE is set — the worker runs in-process so `yarn dev` boots the
// whole system with one command. In production the dedicated worker process
// (src/worker.ts) owns the workers/crons, and the API only needs an enqueue-only
// client so it can schedule reminders.
const runWorkerInline =
  process.env.RUN_WORKER_INLINE === "true" ||
  process.env.NODE_ENV === "development";

(runWorkerInline ? startWorker() : startQueueClient()).catch((error) =>
  console.error("[jobs] failed to start", error),
);

if (process.env.NODE_ENV === "development") {
  (async () => {
    // Dev-only API reference. Dynamic imports keep swagger-ui-express and the
    // openapi module (and its deps) out of production.
    try {
      const { default: swaggerUi } = await import("swagger-ui-express");
      const { buildOpenApiSpec } = await import("./services/openapi/index.js");

      const spec = buildOpenApiSpec(app);

      app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
      app.get("/api/docs.json", (_req, res) => res.json(spec));

      console.log(
        `OpenAPI docs available at: http://localhost:${API_PORT}/api/docs`,
      );
    } catch (error) {
      console.warn("Failed to mount OpenAPI docs:", error);
    }

    const listener = await ngrok.forward({
      addr: API_PORT,
      domain: NGROK_DOMAIN,
      authtoken_from_env: true,
    });

    console.log(`NGROK ingress established at: ${listener.url()}`);
  })();
}
