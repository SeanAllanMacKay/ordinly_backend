import { relations } from "drizzle-orm";
import { ClientTeam, Company, Team, Client, User } from "../schemas/index.js";

export const ClientTeamRelations = relations(ClientTeam, ({ one }) => ({
  team: one(Team, {
    fields: [ClientTeam.teamId],
    references: [Team.id],
    relationName: "team_to_clientTeam",
  }),
  client: one(Client, {
    fields: [ClientTeam.clientId],
    references: [Client.id],
    relationName: "client_to_clientTeam",
  }),
  company: one(Company, {
    fields: [ClientTeam.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [ClientTeam.createdBy],
    references: [User.id],
  }),
}));
