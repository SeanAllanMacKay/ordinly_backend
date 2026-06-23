import { pgTable, uuid, pgEnum, bigint } from "drizzle-orm/pg-core";
import { Task } from "./Task.js";
import { taskRelationshipType } from "../constants.js";

export const TaskRelationshipTypeEnum = pgEnum(
  "task_relationship_type",
  taskRelationshipType,
);

export const TaskRelationship = pgTable("TaskRelationship", {
  id: uuid().defaultRandom().unique().primaryKey(),
  fromId: uuid()
    .references(() => Task.id)
    .notNull(),
  toId: uuid()
    .references(() => Task.id)
    .notNull(),
  type: TaskRelationshipTypeEnum().notNull().default("references"),
});
