import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const User = pgTable("User", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  isVerified: boolean(),
  verificationCode: uuid().defaultRandom().notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  deletedDate: timestamp(),
  // pg-boss job id for the scheduled 30-day hard delete. Stored so a restore
  // (login during the grace window) can best-effort cancel the pending job.
  hardDeleteJobId: text(),
});
