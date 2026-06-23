import { relations } from "drizzle-orm";
import {
  CompanyPermission,
  CompanyPermissionLevel,
  CompanyRolePermission,
} from "../schemas/index.js";

export const CompanyPermissionRelations = relations(
  CompanyPermission,
  ({ many }) => ({
    levels: many(CompanyPermissionLevel),
    assignments: many(CompanyRolePermission),
  }),
);
