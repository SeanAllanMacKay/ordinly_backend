import { pgTable, uuid, timestamp, time, text } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfileInfoList } from "./CompanyProfileInfoList.js";

export const CompanyProfileInfoListItem = pgTable(
  "CompanyProfileInfoListItem",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyProfilInfoListId: uuid()
      .references(() => CompanyProfileInfoList.id)
      .notNull(),
    label: text().notNull(),

    createdDate: timestamp().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
);
