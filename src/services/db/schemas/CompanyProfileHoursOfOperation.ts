import { pgTable, uuid, timestamp, time } from "drizzle-orm/pg-core";

import { User } from "./User.js";
import { CompanyProfile } from "./CompanyProfile.js";

export const CompanyProfileHoursOfOperation = pgTable(
  "CompanyProfileHoursOfOperation",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    companyProfileId: uuid()
      .references(() => CompanyProfile.id)
      .notNull(),
    mondayStart: time(),
    mondayEnd: time(),
    tuesdayStart: time(),
    tuesdayEnd: time(),
    wednesdayStart: time(),
    wednesdayEnd: time(),
    thursdayStart: time(),
    thursdayEnd: time(),
    fridayStart: time(),
    fridayEnd: time(),
    saturdayStart: time(),
    saturdayEnd: time(),
    sundayStart: time(),
    sundayEnd: time(),

    createdDate: timestamp().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
);
