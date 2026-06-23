import {
  companyRolePermissionAction,
  projectPermissionAction,
} from "../constants.js";

// Authoritative content for the permission catalog tables. This is the single
// place that documents every permission and the levels a role can be granted
// for it. `seedPermissions.ts` upserts these into CompanyPermission /
// CompanyPermissionLevel / ProjectPermission / ProjectPermissionLevel.
//
// `sortOrder` is derived from array position (permissions in catalog order,
// levels low->high), so ordering here drives the FE dropdown order.

export type LevelSeed = {
  value: string;
  name: string;
  description: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type PermissionSeed = {
  name: string;
  description: string;
  category?: string;
  levels: LevelSeed[];
};

const crud = (create: boolean, read: boolean, update: boolean, del: boolean) => ({
  create,
  read,
  update,
  delete: del,
});

// "all_*" assets: None / View / Edit (incl. create) / Full Control.
const allLevels = (noun: string): LevelSeed[] => [
  { value: "none", name: "None", description: `Can't see ${noun} that aren't assigned to them`, ...crud(false, false, false, false) },
  { value: "view", name: "View", description: `Can view all ${noun}`, ...crud(false, true, false, false) },
  { value: "edit", name: "Edit", description: `Can view, create and edit all ${noun}`, ...crud(true, true, true, false) },
  { value: "full", name: "Full Control", description: `Can create, edit and delete all ${noun}`, ...crud(true, true, true, true) },
];

// "assigned_*" assets: View / Edit (no create) / Full Control. No "None" —
// being assigned implies at least read access.
const assignedLevels = (noun: string): LevelSeed[] => [
  { value: "view", name: "View", description: `Can view assigned ${noun}`, ...crud(false, true, false, false) },
  { value: "edit", name: "Edit", description: `Can view and edit assigned ${noun}`, ...crud(false, true, true, false) },
  { value: "full", name: "Full Control", description: `Can create, edit and delete assigned ${noun}`, ...crud(true, true, true, true) },
];

// Document assets: None / View / Contribute (upload) / Full Control.
const documentLevels = (noun: string): LevelSeed[] => [
  { value: "none", name: "None", description: `Can't access ${noun}`, ...crud(false, false, false, false) },
  { value: "view", name: "View", description: `Can view and download ${noun}`, ...crud(false, true, false, false) },
  { value: "contribute", name: "Contribute", description: `Can view and upload ${noun}`, ...crud(true, true, false, false) },
  { value: "full", name: "Full Control", description: `Can upload, edit and delete ${noun}`, ...crud(true, true, true, true) },
];

// Settings-style assets that are configured but not created/deleted:
// None / View / Manage.
const manageLevels = (noun: string): LevelSeed[] => [
  { value: "none", name: "None", description: `Can't access ${noun}`, ...crud(false, false, false, false) },
  { value: "view", name: "View", description: `Can view ${noun}`, ...crud(false, true, false, false) },
  { value: "manage", name: "Manage", description: `Can view and edit ${noun}`, ...crud(false, true, true, false) },
];

// Collection assets that can be created and removed:
// None / View / Manage (incl. create) / Full Control.
const collectionLevels = (noun: string): LevelSeed[] => [
  { value: "none", name: "None", description: `Can't access ${noun}`, ...crud(false, false, false, false) },
  { value: "view", name: "View", description: `Can view ${noun}`, ...crud(false, true, false, false) },
  { value: "manage", name: "Manage", description: `Can view, create and edit ${noun}`, ...crud(true, true, true, false) },
  { value: "full", name: "Full Control", description: `Can create, edit and delete ${noun}`, ...crud(true, true, true, true) },
];

export const companyPermissionCatalog: Record<
  (typeof companyRolePermissionAction)[number],
  PermissionSeed
> = {
  company_settings: {
    name: "Company settings",
    category: "Company",
    description: "Company-wide configuration and preferences.",
    levels: manageLevels("company settings"),
  },
  profile: {
    name: "Company profile",
    category: "Company",
    description: "The public-facing company profile.",
    levels: manageLevels("the company profile"),
  },
  workers: {
    name: "Workers",
    category: "Company",
    description: "People who belong to the company.",
    levels: collectionLevels("workers"),
  },
  roles: {
    name: "Roles",
    category: "Company",
    description: "Company roles and the permissions assigned to them.",
    levels: collectionLevels("roles"),
  },
  documents: {
    name: "Documents",
    category: "Documents",
    description: "Company-level documents.",
    levels: documentLevels("company documents"),
  },
  folders: {
    name: "Folders",
    category: "Documents",
    description: "Folders that organise company documents.",
    levels: collectionLevels("folders"),
  },
  invoices: {
    name: "Invoices",
    category: "Finance",
    description: "Company invoices.",
    levels: collectionLevels("invoices"),
  },
  license_numbers: {
    name: "License numbers",
    category: "Company",
    description: "Company license and registration numbers.",
    levels: collectionLevels("license numbers"),
  },
  all_clients: {
    name: "All clients",
    category: "Clients",
    description: "Every client in the company, including unassigned ones.",
    levels: allLevels("clients"),
  },
  all_projects: {
    name: "All projects",
    category: "Projects",
    description: "Every project in the company, including unassigned ones.",
    levels: allLevels("projects"),
  },
  all_tasks: {
    name: "All tasks",
    category: "Tasks",
    description: "Every task in the company, including unassigned ones.",
    levels: allLevels("tasks"),
  },
  all_checklist_items: {
    name: "All checklist items",
    category: "Tasks",
    description: "Every checklist item in the company, including unassigned ones.",
    levels: allLevels("checklist items"),
  },
  assigned_projects: {
    name: "Assigned projects",
    category: "Projects",
    description: "Projects the worker is assigned to.",
    levels: assignedLevels("projects"),
  },
  assigned_tasks: {
    name: "Assigned tasks",
    category: "Tasks",
    description: "Tasks the worker is assigned to.",
    levels: assignedLevels("tasks"),
  },
  assigned_clients: {
    name: "Assigned clients",
    category: "Clients",
    description: "Clients the worker is assigned to.",
    levels: assignedLevels("clients"),
  },
  assigned_checklist_items: {
    name: "Assigned checklist items",
    category: "Tasks",
    description: "Checklist items the worker is assigned to.",
    levels: assignedLevels("checklist items"),
  },
  project_documents: {
    name: "Project documents",
    category: "Documents",
    description: "Documents attached to projects.",
    levels: documentLevels("project documents"),
  },
  task_documents: {
    name: "Task documents",
    category: "Documents",
    description: "Documents attached to tasks.",
    levels: documentLevels("task documents"),
  },
  checklist_item_documents: {
    name: "Checklist item documents",
    category: "Documents",
    description: "Documents attached to checklist items.",
    levels: documentLevels("checklist item documents"),
  },
};

export const projectPermissionCatalog: Record<
  (typeof projectPermissionAction)[number],
  PermissionSeed
> = {
  invoices: {
    name: "Invoices",
    category: "Finance",
    description: "Invoices for this project.",
    levels: collectionLevels("invoices"),
  },
  project_roles: {
    name: "Project roles",
    category: "Roles",
    description: "Roles scoped to this project and their permissions.",
    levels: collectionLevels("project roles"),
  },
  project_documents: {
    name: "Project documents",
    category: "Documents",
    description: "Documents attached to this project.",
    levels: documentLevels("project documents"),
  },
  all_tasks: {
    name: "All tasks",
    category: "Tasks",
    description: "Every task in this project, including unassigned ones.",
    levels: allLevels("tasks"),
  },
  assigned_tasks: {
    name: "Assigned tasks",
    category: "Tasks",
    description: "Tasks in this project the worker is assigned to.",
    levels: assignedLevels("tasks"),
  },
  task_documents: {
    name: "Task documents",
    category: "Documents",
    description: "Documents attached to this project's tasks.",
    levels: documentLevels("task documents"),
  },
  all_checklist_items: {
    name: "All checklist items",
    category: "Tasks",
    description: "Every checklist item in this project, including unassigned ones.",
    levels: allLevels("checklist items"),
  },
  assigned_checklist_items: {
    name: "Assigned checklist items",
    category: "Tasks",
    description: "Checklist items in this project the worker is assigned to.",
    levels: assignedLevels("checklist items"),
  },
  checklist_item_documents: {
    name: "Checklist item documents",
    category: "Documents",
    description: "Documents attached to this project's checklist items.",
    levels: documentLevels("checklist item documents"),
  },
};
