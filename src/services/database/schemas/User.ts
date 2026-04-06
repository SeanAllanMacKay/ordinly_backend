import mongoose from "mongoose";

import database from "../";

import { ObjectId } from "mongodb";

import type { UserDocumentType, UserModelType } from "../types";

const { Schema } = mongoose;

const userSchema = new Schema<UserDocumentType>(
  {
    _id: { type: ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: {
      type: String,
      required: true,
      default: () => new ObjectId().toString(),
    },
    companies: [Schema.Types.ObjectId],
    projects: [Schema.Types.ObjectId],
  },
  { collection: "Users" },
);

database.model("User", userSchema);

export default database.model<UserDocumentType, UserModelType>("User");
