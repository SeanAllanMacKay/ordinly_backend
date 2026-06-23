import { relations } from "drizzle-orm";
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  User,
  UserProject,
  ProjectClient,
  ProjectDocument,
  CompanyProject,
  Task,
  ProjectLocation,
} from "../schemas/index.js";

export const ProjectRelations = relations(Project, ({ one, many }) => ({
  priority: one(ProjectPriority, {
    fields: [Project.priority],
    references: [ProjectPriority.id],
  }),
  status: one(ProjectStatus, {
    fields: [Project.status],
    references: [ProjectStatus.id],
  }),
  createdBy: one(User, {
    fields: [Project.createdBy],
    references: [User.id],
  }),
  deletedBy: one(User, {
    fields: [Project.deletedBy],
    references: [User.id],
  }),

  tasks: many(Task),
  locations: many(ProjectLocation),
  users: many(UserProject, { relationName: "project_to_userProject" }),
  clients: many(ProjectClient, {
    relationName: "project_to_projectClient",
  }),
  documents: many(ProjectDocument, {
    relationName: "project_to_projectDocument",
  }),
  companies: many(CompanyProject, {
    relationName: "project_to_companyProject",
  }),
}));
