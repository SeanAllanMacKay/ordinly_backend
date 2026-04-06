import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { Company } from "./Company";
import { User } from "./User";

export const CompanySubscription = pgTable("CompanySubscription", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  isActive: boolean().notNull(),
  externalSubscriptionId: text(),
  externalCustomerId: text(),

  createdDate: timestamp().defaultNow().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
  deletedDate: timestamp(),
  deletedBy: uuid().references(() => User.id),
});
