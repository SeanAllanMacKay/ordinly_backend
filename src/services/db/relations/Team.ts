import { relations } from "drizzle-orm";
import { Company, Document, Team, TeamMember, User } from "../schemas/index.js";

export const TeamRelations = relations(Team, ({ one, many }) => ({
  company: one(Company, {
    fields: [Team.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [Team.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Team.deletedBy],
    references: [User.id],
  }),
  profilePicture: one(Document, {
    fields: [Team.profilePicture],
    references: [Document.id],
  }),
  members: many(TeamMember),
}));
