import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Document } from "./Document";
import { User } from "./User";
import { Task } from "./Task";

export const TaskDocument = pgTable("TaskDocument", {
  id: uuid().defaultRandom().unique().primaryKey(),
  taskId: uuid()
    .references(() => Task.id)
    .notNull(),
  documentId: uuid()
    .references(() => Document.id)
    .notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
