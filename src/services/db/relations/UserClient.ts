import { relations } from "drizzle-orm";
import { Client, User, UserClient } from "../schemas";

export const UserClientRelations = relations(UserClient, ({ one }) => ({
  user: one(User, {
    fields: [UserClient.userId],
    references: [User.id],
    relationName: "user_to_userClient",
  }),
  client: one(Client, {
    fields: [UserClient.clientId],
    references: [Client.id],
    relationName: "client_to_userClient",
  }),
  assignedBy: one(User, {
    fields: [UserClient.assignedBy],
    references: [User.id],
  }),
}));
