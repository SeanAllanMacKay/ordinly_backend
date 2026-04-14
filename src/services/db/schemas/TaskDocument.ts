import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Document } from "./Document.js";
import { User } from "./User.js";
import { Task } from "./Task.js";

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
