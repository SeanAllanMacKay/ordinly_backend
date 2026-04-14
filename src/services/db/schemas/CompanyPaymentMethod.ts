import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { User } from "./User.js";
import { PaymentMethod } from "./PaymentMethod.js";

export const CompanyPaymentMethod = pgTable("CompanyPaymentMethod", {
  id: uuid().defaultRandom().unique().primaryKey(),
  companyId: uuid()
    .references(() => Company.id)
    .notNull(),
  paymentMethodId: uuid()
    .references(() => PaymentMethod.id)
    .notNull(),

  createdDate: timestamp().notNull(),
  createdBy: uuid()
    .references(() => User.id)
    .notNull(),
});
