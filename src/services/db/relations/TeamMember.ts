import { relations } from "drizzle-orm";
import { Team, TeamMember, User } from "../schemas/index.js";

export const TeamMemberRelations = relations(TeamMember, ({ one }) => ({
  team: one(Team, {
    fields: [TeamMember.teamId],
    references: [Team.id],
  }),
  user: one(User, {
    fields: [TeamMember.userId],
    references: [User.id],
  }),
}));
