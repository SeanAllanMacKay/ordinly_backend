import mongoose from "mongoose";

import database from "../";

import type { TaskDocument, TaskModel } from "../types";

const { Schema } = mongoose;

const taskSchema = new Schema<TaskDocument>(
  {
    // task details
    name: { type: String, required: true },
    description: String,
    status: String,
    priority: String,
    checklist: [
      {
        label: String,
        completed: Boolean,
      },
    ],

    // related entities
    projectId: { type: String, required: true },
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
  { collection: "Tasks" }
);

database.model("Task", taskSchema);

export default database.model<TaskDocument, TaskModel>("Task");
