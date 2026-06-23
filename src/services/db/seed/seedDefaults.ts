import { isNull } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

import {
  db,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
} from "../index.js";
import { seedPermissions } from "./seedPermissions.js";
import { seedCompanyRoles } from "./seedCompanyRoles.js";

const projectStatuses: (typeof ProjectStatus.$inferInsert)[] = [
  { name: "Not started", description: "The project hasn't started yet", color: "#9CA3AF", isTerminal: false },
  { name: "In progress", description: "The project is being worked on", color: "#3B82F6", isTerminal: false },
  { name: "On hold", description: "The project has been paused", color: "#F59E0B", isTerminal: false },
  { name: "Complete", description: "The project has been completed", color: "#22C55E", isTerminal: true },
  { name: "Cancelled", description: "The project has been cancelled", color: "#6B7280", isTerminal: true },
];

const taskStatuses: (typeof TaskStatus.$inferInsert)[] = [
  { name: "Not started", description: "The task hasn't started yet", color: "#9CA3AF", isTerminal: false },
  { name: "In progress", description: "The task is being worked on", color: "#3B82F6", isTerminal: false },
  { name: "On hold", description: "The task has been paused", color: "#F59E0B", isTerminal: false },
  { name: "Blocked", description: "The task is blocked by a dependency", color: "#EF4444", isTerminal: false },
  { name: "Complete", description: "The task has been completed", color: "#22C55E", isTerminal: true },
  { name: "Cancelled", description: "The task has been cancelled", color: "#6B7280", isTerminal: true },
];

const projectPriorities: (typeof ProjectPriority.$inferInsert)[] = [
  { name: "Critical", description: "Critical priority", color: "#DC2626" },
  { name: "High", description: "High priority", color: "#F97316" },
  { name: "Medium", description: "Medium priority", color: "#EAB308" },
  { name: "Low", description: "Low priority", color: "#9CA3AF" },
];

const taskPriorities: (typeof TaskPriority.$inferInsert)[] = [
  { name: "Critical", description: "Critical priority", color: "#DC2626", isCritical: true },
  { name: "High", description: "High priority", color: "#F97316", isCritical: false },
  { name: "Medium", description: "Medium priority", color: "#EAB308", isCritical: false },
  { name: "Low", description: "Low priority", color: "#9CA3AF", isCritical: false },
];

// Insert only the global (companyId IS NULL) rows whose `name` does not already
// exist, so the seed can be re-run without creating duplicates.
const seedTable = async <T extends PgTable & { name: any; companyId: any }>(
  label: string,
  table: T,
  rows: { name: string }[],
) => {
  const existing = await db
    .select({ name: table.name })
    .from(table as any)
    .where(isNull(table.companyId));

  const existingNames = new Set(existing.map((row) => row.name));
  const missing = rows.filter((row) => !existingNames.has(row.name));

  if (!missing.length) {
    console.log(`${label}: up to date (${existingNames.size} global rows)`);
    return;
  }

  await db.insert(table as any).values(missing as any);
  console.log(`${label}: inserted ${missing.length} (${missing.map((r) => r.name).join(", ")})`);
};

const main = async () => {
  await seedTable("ProjectStatus", ProjectStatus, projectStatuses);
  await seedTable("TaskStatus", TaskStatus, taskStatuses);
  await seedTable("ProjectPriority", ProjectPriority, projectPriorities);
  await seedTable("TaskPriority", TaskPriority, taskPriorities);
  await seedPermissions();
  await seedCompanyRoles();
};

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
