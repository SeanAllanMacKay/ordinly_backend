import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

// Global, app-defined catalog of project-scoped permission assets. See
// CompanyPermission for the rationale on why there is no `companyId`.
export const ProjectPermission = pgTable("ProjectPermission", {
  id: uuid().defaultRandom().unique().primaryKey(),
  key: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull(),
  category: text(),
  sortOrder: integer().default(0).notNull(),

  createdDate: timestamp().defaultNow().notNull(),
});
