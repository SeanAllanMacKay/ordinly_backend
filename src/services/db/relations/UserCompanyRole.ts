import { relations } from "drizzle-orm";
import { CompanyRole, UserCompany, UserCompanyRole } from "../schemas/index.js";

export const UserCompanyRoleRelations = relations(
  UserCompanyRole,
  ({ one }) => ({
    worker: one(UserCompany, {
      fields: [UserCompanyRole.userCompanyId],
      references: [UserCompany.id],
    }),
    role: one(CompanyRole, {
      fields: [UserCompanyRole.roleId],
      references: [CompanyRole.id],
    }),
  }),
);
