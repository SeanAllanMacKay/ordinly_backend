import type { Document, Model } from "mongoose";

export interface TaskType {
  projectId: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  checklist?: {
    label: string;
    completed?: boolean;
  }[];

  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  documents?: string[];

  createdAt: Date;
  startDate?: Date;
  dueDate?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

//@ts-ignore
export interface TaskDocument extends Document, TaskType {}

//@ts-ignore
export interface TaskModel extends Model<TaskDocument> {}
