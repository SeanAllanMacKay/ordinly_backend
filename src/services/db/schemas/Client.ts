import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { User } from "./User";

export const Client = pgTable("Client", {
  id: uuid().defaultRandom().unique().primaryKey(),
  name: text(),
  description: text(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  clientCompanyId: uuid().references(() => Company.id),
  clientUserId: uuid().references(() => User.id),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
