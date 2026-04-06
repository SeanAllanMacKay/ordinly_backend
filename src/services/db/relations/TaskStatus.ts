import { relations } from "drizzle-orm";
import { Company, TaskStatus, User } from "../schemas";

export const TaskStatusRelations = relations(TaskStatus, ({ one }) => ({
  company: one(Company, {
    fields: [TaskStatus.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [TaskStatus.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [TaskStatus.deletedBy],
    references: [User.id],
  }),
}));
