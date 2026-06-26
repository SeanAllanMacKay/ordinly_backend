import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { Document } from "./Document.js";

export const User = pgTable("User", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  // Profile picture, stored as WebP size variants under one Document (mirrors
  // Company.logo). Nullable — the FE falls back to initials when unset. The
  // explicit AnyPgColumn return type breaks the User<->Document type cycle
  // (Document references User for createdBy/deletedBy).
  profilePicture: uuid().references((): AnyPgColumn => Document.id),
  // BCP-47 locale tag (e.g. "en", "en-US"). The FE owns the supported set; we
  // persist whatever it sends so a user's i18n choice survives across sign-ins.
  preferredLanguage: text().default("en").notNull(),
  password: text().notNull(),
  isVerified: boolean(),
  verificationCode: uuid().defaultRandom().notNull(),

  createdDate: timestamp().defaultNow().notNull(),
  deletedDate: timestamp(),
  // pg-boss job id for the scheduled 30-day hard delete. Stored so a restore
  // (login during the grace window) can best-effort cancel the pending job.
  hardDeleteJobId: text(),
});
