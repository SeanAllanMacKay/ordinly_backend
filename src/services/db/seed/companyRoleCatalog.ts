import { companyRolePermissionAction } from "../constants.js";

// Authoritative content for the default, out-of-the-box company roles. These
// are seeded as global roles (companyId = NULL) by `seedCompanyRoles.ts`,
// matching the global-defaults convention used for ProjectStatus/TaskStatus.
//
// Each role declares a description and a map of permission `key` -> level
// `value`. Level values must exist in the matching preset in
// `permissionCatalog.ts`. Omitting a permission means NO grant (no
// CompanyRolePermission row) — for `assigned_*` permissions, which have no
// "none" level, omission is the only way to express "no access".

export type CompanyRoleSeed = {
  description: string;
  permissions: Partial<
    Record<(typeof companyRolePermissionAction)[number], string>
  >;
};

// Keyed by role name. Order here is the order roles are seeded/listed.
export const companyRoleCatalog: Record<string, CompanyRoleSeed> = {
  Owner: {
    description:
      "Full control of the company. Distinguished from Company Manager only by Company.owner, outside RBAC.",
    permissions: {
      company_settings: "manage",
      profile: "manage",
      workers: "full",
      roles: "full",
      teams: "full",
      documents: "full",
      folders: "full",
      invoices: "full",
      license_numbers: "full",
      all_clients: "full",
      all_projects: "full",
      all_tasks: "full",
      all_checklist_items: "full",
      assigned_projects: "full",
      assigned_tasks: "full",
      assigned_clients: "full",
      assigned_checklist_items: "full",
      project_documents: "full",
      task_documents: "full",
      checklist_item_documents: "full",
    },
  },
  "Company Manager": {
    description:
      "Full control of the company except editing role definitions (Roles is view only).",
    permissions: {
      company_settings: "manage",
      profile: "manage",
      workers: "full",
      roles: "view",
      teams: "full",
      documents: "full",
      folders: "full",
      invoices: "full",
      license_numbers: "full",
      all_clients: "full",
      all_projects: "full",
      all_tasks: "full",
      all_checklist_items: "full",
      assigned_projects: "full",
      assigned_tasks: "full",
      assigned_clients: "full",
      assigned_checklist_items: "full",
      project_documents: "full",
      task_documents: "full",
      checklist_item_documents: "full",
    },
  },
  "Office Administrator": {
    description: "Manages company personnel and the company profile.",
    permissions: {
      company_settings: "manage",
      profile: "manage",
      workers: "full",
      roles: "view",
      teams: "manage",
      documents: "contribute",
      folders: "manage",
      invoices: "view",
      license_numbers: "manage",
      all_clients: "view",
      all_projects: "view",
      all_tasks: "view",
      all_checklist_items: "view",
      assigned_projects: "view",
      assigned_tasks: "view",
      assigned_clients: "view",
      assigned_checklist_items: "view",
      project_documents: "view",
      task_documents: "view",
      checklist_item_documents: "view",
    },
  },
  "Project Manager": {
    description: "Manages all projects, tasks and their work.",
    permissions: {
      profile: "view",
      workers: "view",
      teams: "view",
      documents: "view",
      folders: "view",
      invoices: "view",
      license_numbers: "view",
      all_clients: "edit",
      all_projects: "full",
      all_tasks: "full",
      all_checklist_items: "full",
      assigned_projects: "full",
      assigned_tasks: "full",
      assigned_clients: "edit",
      assigned_checklist_items: "full",
      project_documents: "full",
      task_documents: "full",
      checklist_item_documents: "full",
    },
  },
  Worker: {
    description: "Does work assigned to them.",
    permissions: {
      profile: "view",
      workers: "view",
      teams: "view",
      documents: "view",
      folders: "view",
      assigned_projects: "edit",
      assigned_tasks: "edit",
      assigned_clients: "view",
      assigned_checklist_items: "edit",
      project_documents: "contribute",
      task_documents: "contribute",
      checklist_item_documents: "contribute",
    },
  },
  Contractor: {
    description: "External worker who does work assigned to them, more restricted.",
    permissions: {
      assigned_projects: "view",
      assigned_tasks: "edit",
      assigned_clients: "view",
      assigned_checklist_items: "edit",
      project_documents: "contribute",
      task_documents: "contribute",
      checklist_item_documents: "contribute",
    },
  },
};
