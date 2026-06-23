import { relations } from "drizzle-orm";
import { Project, ProjectLocation } from "../schemas/index.js";

export const ProjectLocationRelations = relations(
  ProjectLocation,
  ({ one, many }) => ({
    project: one(Project, {
      fields: [ProjectLocation.projectId],
      references: [Project.id],
    }),
  }),
);
