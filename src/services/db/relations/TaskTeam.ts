import { relations } from "drizzle-orm";
import { TaskTeam, Company, Team, Task, User } from "../schemas/index.js";

export const TaskTeamRelations = relations(TaskTeam, ({ one }) => ({
  team: one(Team, {
    fields: [TaskTeam.teamId],
    references: [Team.id],
    relationName: "team_to_taskTeam",
  }),
  task: one(Task, {
    fields: [TaskTeam.taskId],
    references: [Task.id],
    relationName: "task_to_taskTeam",
  }),
  company: one(Company, {
    fields: [TaskTeam.companyId],
    references: [Company.id],
  }),
  createdBy: one(User, {
    fields: [TaskTeam.createdBy],
    references: [User.id],
  }),
}));
