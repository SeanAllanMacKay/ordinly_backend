import { relations } from "drizzle-orm";
import {
  Client,
  Company,
  User,
  CompanyProfile,
  UserCompany,
  CompanyProject,
  CompanyDocument,
  CompanySubscription,
} from "../schemas";

export const CompanyRelations = relations(Company, ({ one, many }) => ({
  owner: one(User, {
    fields: [Company.owner],
    references: [User.id],
  }),
  createdBy: one(User, {
    fields: [Company.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Company.deletedBy],
    references: [User.id],
  }),
  profile: one(CompanyProfile, {
    fields: [Company.profile],
    references: [CompanyProfile.id],
  }),
  subscription: one(CompanySubscription),

  users: many(UserCompany, { relationName: "company_to_userCompany" }),
  clients: many(Client),
  projects: many(CompanyProject, {
    relationName: "company_to_companyProject",
  }),
  documents: many(CompanyDocument, {
    relationName: "company_to_companyDocument",
  }),
}));
