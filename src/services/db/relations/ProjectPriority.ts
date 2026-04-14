import { relations } from "drizzle-orm";
import { ProjectPriority, User, Company } from "../schemas/index.js";

export const ProjectPriorityRelations = relations(
  ProjectPriority,
  ({ one }) => ({
    company: one(Company, {
      fields: [ProjectPriority.companyId],
      references: [Company.id],
    }),
    createdBy: one(User, {
      fields: [ProjectPriority.createdBy],
      references: [User.id],
    }),
    deletedBy: one(User, {
      fields: [ProjectPriority.deletedBy],
      references: [User.id],
    }),
  }),
);
