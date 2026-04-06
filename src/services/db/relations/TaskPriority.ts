import { relations } from "drizzle-orm";
import { TaskPriority, User, Company } from "../schemas";

export const TaskPriorityRelations = relations(TaskPriority, ({ one }) => ({
  company: one(Company, {
    fields: [TaskPriority.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [TaskPriority.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [TaskPriority.deletedBy],
    references: [User.id],
  }),
}));
