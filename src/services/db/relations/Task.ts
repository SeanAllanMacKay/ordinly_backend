import { relations } from "drizzle-orm";
import {
  Task,
  TaskStatus,
  TaskPriority,
  User,
  Project,
  TaskDocument,
  UserTask,
} from "../schemas";
import { TaskChecklistItem } from "../schemas/TaskChecklistItem";

export const TaskRelations = relations(Task, ({ one, many }) => ({
  project: one(Project, {
    fields: [Task.projectId],
    references: [Project.id],
  }),
  status: one(TaskStatus, {
    fields: [Task.status],
    references: [TaskStatus.id],
  }),
  priority: one(TaskPriority, {
    fields: [Task.priority],
    references: [TaskPriority.id],
  }),
  createdBy: one(User, {
    fields: [Task.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Task.deletedBy],
    references: [User.id],
  }),

  users: many(UserTask, { relationName: "task_to_userTask" }),
  documents: many(TaskDocument, { relationName: "task_to_taskDocument" }),
  checklist: many(TaskChecklistItem),
}));
