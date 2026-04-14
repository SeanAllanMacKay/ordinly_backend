import { relations } from "drizzle-orm";
import { CompanyStatus, User } from "../schemas/index.js";

export const CompanyStatusRelations = relations(CompanyStatus, ({ one }) => ({
  createdBy: one(User, {
    fields: [CompanyStatus.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [CompanyStatus.deletedBy],
    references: [User.id],
  }),
}));
