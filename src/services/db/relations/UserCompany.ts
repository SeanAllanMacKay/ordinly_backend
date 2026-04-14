import { relations } from "drizzle-orm";
import { Company, User, UserCompany } from "../schemas/index.js";
import { UserCompanyRole } from "../schemas/UserCompanyRole";

export const UserCompanyRelations = relations(UserCompany, ({ one, many }) => ({
  user: one(User, {
    fields: [UserCompany.userId],
    references: [User.id],
    relationName: "user_to_userCompany",
  }),
  company: one(Company, {
    fields: [UserCompany.companyId],
    references: [Company.id],
    relationName: "company_to_userCompany",
  }),
  roles: many(UserCompanyRole),
  assignedBy: one(User, {
    fields: [UserCompany.assignedBy],
    references: [User.id],
  }),
}));
