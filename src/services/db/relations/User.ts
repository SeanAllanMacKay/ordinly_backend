import { relations } from "drizzle-orm";
import {
  User,
  UserClient,
  UserCompany,
  UserDocument,
  UserProject,
  UserTask,
} from "../schemas";

export const UserRelations = relations(User, ({ many }) => ({
  companies: many(UserCompany, { relationName: "user_to_userCompany" }),
  projects: many(UserProject, { relationName: "user_to_userProject" }),
  clients: many(UserClient, { relationName: "user_to_userClient" }),
  documents: many(UserDocument, { relationName: "user_to_userDocument" }),
  tasks: many(UserTask, { relationName: "user_to_userTask" }),
}));
