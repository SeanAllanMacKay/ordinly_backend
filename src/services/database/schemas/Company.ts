import mongoose from "mongoose";

import database from "../";

import type { CompanyDocument, CompanyModel } from "../types";

const { Schema } = mongoose;

const companySchema = new Schema<CompanyDocument>(
  {
    owner: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: Date,
    deletedBy: Schema.Types.ObjectId,
    deletedAt: Date,
    profile: {
      tagline: String,
      description: String,
      tags: [String],
      location: {
        country: String,
        region: String,
        city: String,
        streetAddress: String,
      },
    },
    workers: [
      {
        userId: String,
        email: String,
        role: String,
        status: String,
        addedBy: String,
        addedAt: Date,
        removedAt: Date,
      },
    ],
    projects: [
      {
        projectId: Schema.Types.ObjectId,
        clients: [Schema.Types.ObjectId],
        assignees: [Schema.Types.ObjectId],
      },
    ],
    clients: [String],
    subscription: {
      active: Boolean,
      subscriptionId: String,
      customerId: String,
    },
  },
  { collection: "Companies" }
);

//@ts-ignore
database.model("Company", companySchema);

//@ts-ignore
export default database.model<CompanyDocument, CompanyModel>("Company");
