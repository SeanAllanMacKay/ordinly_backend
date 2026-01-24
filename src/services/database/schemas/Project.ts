import mongoose from "mongoose";

import database from "../";

import type { ProjectDocument, ProjectModel } from "../types";

const { Schema } = mongoose;

const projectSchema = new Schema<ProjectDocument>(
  {
    // project details
    name: { type: String, required: true },
    description: String,
    status: String,
    priority: String,
    tasks: [{ taskId: String, assignees: [String] }],

    // related entities
    owner: {
      type: { variant: String, id: String },
      required: true,
    },
    createdBy: { type: String, required: true },
    updatedBy: String,
    deletedBy: String,
    documents: [String],

    // relavent dates
    createdAt: { type: Date, default: Date.now, required: true },
    startDate: Date,
    dueDate: Date,
    updatedAt: Date,
    deletedAt: Date,
  },
  { collection: "Projects" }
);

database.model("Project", projectSchema);

export default database.model<ProjectDocument, ProjectModel>("Project");
