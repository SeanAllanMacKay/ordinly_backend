import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";

import { Company } from "./Company.js";
import { Contact } from "./Contact.js";
import { Project } from "./Project.js";
import { User } from "./User.js";

export const ProjectContact = pgTable(
  "ProjectContact",
  {
    id: uuid().defaultRandom().unique().primaryKey(),
    contactId: uuid()
      .references(() => Contact.id)
      .notNull(),
    projectId: uuid()
      .references(() => Project.id)
      .notNull(),
    companyId: uuid().references(() => Company.id),

    createdDate: timestamp().defaultNow().notNull(),
    createdBy: uuid()
      .references(() => User.id)
      .notNull(),
  },
  (table) => ({
    // One link row per (project, contact) — makes re-linking idempotent.
    projectContactUnique: unique("project_contact_unique").on(
      table.projectId,
      table.contactId,
    ),
    projectContactProjectIdx: index("project_contact_project_idx").on(
      table.projectId,
    ),
    projectContactContactIdx: index("project_contact_contact_idx").on(
      table.contactId,
    ),
  }),
);
