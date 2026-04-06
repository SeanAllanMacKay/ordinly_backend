import { relations } from "drizzle-orm";
import { Task } from "../schemas";
import { TaskChecklistItem } from "../schemas/TaskChecklistItem";

export const TaskChecklistItemRelations = relations(
  TaskChecklistItem,
  ({ one }) => ({
    task: one(Task, {
      fields: [TaskChecklistItem.taskId],
      references: [Task.id],
    }),
  }),
);
