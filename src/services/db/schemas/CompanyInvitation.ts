import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { Company } from "./Company.js";
import { CompanyRole } from "./CompanyRole.js";

// Pending invitations for people who haven't joined the company yet. Existing
// users are added to a company immediately (UserCompany + UserCompanyRole);
// brand-new users get a "pending" invitation that signUp converts into a
// membership once they create an account. `status` values come from
// `companyInvitationStatus` in constants.ts.
export const CompanyInvitation = pgTable(
  "CompanyInvitation",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyId: uuid()
      .references(() => Company.id)
      .notNull(),
    email: text().notNull(),
    roleId: uuid()
      .references(() => CompanyRole.id)
      .notNull(),
    status: text().default("pending").notNull(),
    token: uuid().defaultRandom().notNull(),

    invitedDate: timestamp().defaultNow().notNull(),
    invitedBy: uuid().references(() => User.id),
    respondedDate: timestamp(),
  },
  (table) => ({
    // Look up pending invites for a company, and by email on signup
    companyInvitationCompanyIdx: index("company_invitation_company_idx").on(
      table.companyId,
    ),
    companyInvitationEmailIdx: index("company_invitation_email_idx").on(
      table.email,
    ),
  }),
);
