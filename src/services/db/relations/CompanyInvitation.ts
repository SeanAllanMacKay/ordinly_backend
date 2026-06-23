import { relations } from "drizzle-orm";
import {
  Company,
  CompanyInvitation,
  CompanyRole,
  User,
} from "../schemas/index.js";

export const CompanyInvitationRelations = relations(
  CompanyInvitation,
  ({ one }) => ({
    company: one(Company, {
      fields: [CompanyInvitation.companyId],
      references: [Company.id],
    }),
    role: one(CompanyRole, {
      fields: [CompanyInvitation.roleId],
      references: [CompanyRole.id],
    }),
    invitedBy: one(User, {
      fields: [CompanyInvitation.invitedBy],
      references: [User.id],
    }),
  }),
);
