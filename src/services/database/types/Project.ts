import type { Document, Model } from "mongoose";

export interface ProjectType {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  tasks?: { taskId: string; assignees?: string[] }[];
  milestones?: {
    _id?: string;
    name: string;
    description?: string;
    tasks: string[];
    dueDate?: Date;
    createdAt: Date;
    createdBy: string;
    deletedAt?: Date;
    deletedBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
  }[];
  owner: { variant: string; id: string };
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
export interface ProjectDocument extends Document, ProjectType {}

//@ts-ignore
export interface ProjectModel extends Model<ProjectDocument> {}
