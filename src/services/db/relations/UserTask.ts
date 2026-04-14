import { relations } from "drizzle-orm";
import { Company, Task, User, UserTask } from "../schemas/index.js";

export const UserTaskRelations = relations(UserTask, ({ one }) => ({
  user: one(User, {
    fields: [UserTask.userId],
    references: [User.id],
    relationName: "user_to_userTask",
  }),
  task: one(Task, {
    fields: [UserTask.taskId],
    references: [Task.id],
    relationName: "task_to_userTask",
  }),
  company: one(Company, {
    fields: [UserTask.companyId],
    references: [Company.id],
  }),
  assignedBy: one(User, {
    fields: [UserTask.assignedBy],
    references: [User.id],
  }),
}));
