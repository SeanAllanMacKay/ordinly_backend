import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import routers from "./routers";
import cors from "cors";
import cookieParser from "cookie-parser";
import ngrok from "@ngrok/ngrok";

const DB_URL = process.env.DB_URL;
const API_PORT = process.env.API_PORT;
const FE_ORIGIN = process.env.FE_ORIGIN;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const NGROK_DOMAIN = process.env.NGROK_DOMAIN;

process.on("uncaughtException", (error) => {
  console.error(error);
});

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [`http://${FE_ORIGIN}`, `https://${FE_ORIGIN}`],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(COOKIE_SECRET));

const database = mongoose.createConnection(DB_URL ?? "", {});

database
  .on("error", (error: any) => {
    console.error(error);
  })
  .once("open", async () => {
    console.log("Database connected");

    const server = createServer(app);

    server.listen(API_PORT, () => {
      console.log(`Server online: connected to port ${API_PORT}`);

      app.use("/api", routers);
    });

    if (process.env.NODE_ENV === "development") {
      (async () => {
        const listener = await ngrok.forward({
          addr: API_PORT,
          domain: NGROK_DOMAIN,
          authtoken_from_env: true,
        });

        console.log(`NGROK ingress established at: ${listener.url()}`);
      })();
    }
  });
