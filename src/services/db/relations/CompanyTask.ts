import { relations } from "drizzle-orm";
import { CompanyTask, Company, User, Task } from "../schemas/index.js";

export const CompanyTaskRelations = relations(CompanyTask, ({ one }) => ({
  company: one(Company, {
    fields: [CompanyTask.companyId],
    references: [Company.id],
  }),
  task: one(Task, {
    fields: [CompanyTask.taskId],
    references: [Task.id],
  }),
  assignedBy: one(User, {
    fields: [CompanyTask.assignedBy],
    references: [User.id],
  }),
}));
