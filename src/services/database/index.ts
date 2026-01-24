import mongoose from "mongoose";

const DB_URL: string = process.env.DB_URL || "";

const connection = mongoose.createConnection(DB_URL, {});

export default connection;

export * from "./schemas";
