import { pgTable, uuid, pgEnum, bigint } from "drizzle-orm/pg-core";
import { Task } from "./Task.js";
import { taskSequenceType } from "../constants.js";

export const TaskSequenceTypeEnum = pgEnum(
  "task_sequence_type",
  taskSequenceType,
);

export const TaskSequence = pgTable("TaskSequence", {
  id: uuid().defaultRandom().unique().primaryKey(),
  predecessorId: uuid()
    .references(() => Task.id)
    .notNull(),
  successorId: uuid()
    .references(() => Task.id)
    .notNull(),
  type: TaskSequenceTypeEnum().notNull().default("finish-to-start"),
  // In seconds
  lagOffset: bigint({ mode: "number" }).notNull().default(0),
});
