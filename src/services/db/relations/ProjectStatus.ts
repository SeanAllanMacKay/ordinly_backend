import { relations } from "drizzle-orm";
import { ProjectStatus, Company, User } from "../schemas/index.js";

export const ProjectStatusRelations = relations(ProjectStatus, ({ one }) => ({
  company: one(Company, {
    fields: [ProjectStatus.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [ProjectStatus.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [ProjectStatus.deletedBy],
    references: [User.id],
  }),
}));
