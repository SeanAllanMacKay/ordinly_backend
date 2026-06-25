import { relations } from "drizzle-orm";
import {
  ProjectTeam,
  Company,
  Team,
  Project,
  User,
} from "../schemas/index.js";

export const ProjectTeamRelations = relations(ProjectTeam, ({ one }) => ({
  team: one(Team, {
    fields: [ProjectTeam.teamId],
    references: [Team.id],
    relationName: "team_to_projectTeam",
  }),
  project: one(Project, {
    fields: [ProjectTeam.projectId],
    references: [Project.id],
    relationName: "project_to_projectTeam",
  }),
  company: one(Company, {
    fields: [ProjectTeam.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [ProjectTeam.createdBy],
    references: [User.id],
  }),
}));
