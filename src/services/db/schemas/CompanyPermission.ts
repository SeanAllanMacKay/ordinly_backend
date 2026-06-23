import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

// Global, app-defined catalog of company-scoped permission assets. Unlike
// ProjectStatus/TaskStatus these are NOT company-customizable — enforcement code
// keys off the fixed `key`, so there is no `companyId`. Seeded from
// seed/permissionCatalog.ts.
export const CompanyPermission = pgTable("CompanyPermission", {
  id: uuid().defaultRandom().unique().primaryKey(),
  key: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull(),
  category: text(),
  sortOrder: integer().default(0).notNull(),

  createdDate: timestamp().defaultNow().notNull(),
});
