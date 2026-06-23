export const companyRolePermissionAction = [
  "company_settings",
  "profile",
  "workers",
  "roles",
  "teams",
  "documents",
  "folders",
  "invoices",
  "license_numbers",
  "all_clients",
  "all_projects",
  "all_tasks",
  "all_checklist_items",
  "assigned_projects",
  "assigned_tasks",
  "assigned_clients",
  "assigned_checklist_items",
  "project_documents",
  "task_documents",
  "checklist_item_documents",
] as const;

export const projectPermissionAction = [
  "invoices",
  "project_roles",
  "project_documents",
  "all_tasks",
  "assigned_tasks",
  "task_documents",
  "all_checklist_items",
  "assigned_checklist_items",
  "checklist_item_documents",
] as const;

export const companyInvitationStatus = [
  "pending",
  "accepted",
  "revoked",
  "declined",
] as const;

export const locationType = [
  "country",
  "region",
  "postcode",
  "district",
  "place",
  "locality",
  "neighborhood",
  "address",
] as const;

// Polymorphic owner types for shared contact sub-entities (PhoneNumber,
// EmailAddress, Location). These attach to many parents via `ownerType` +
// `ownerId`; extend this list as new owners are added.
export const ownerType = ["client", "contact"] as const;

export const taskType = ["phase", "milestone", "task"] as const;

/**
 * start-to-start: Task 1 must be started to start task 2
 * start-to-finish: Task 1 must be started to finish task 1
 * finish-to-start: Task 1 must be finished to start task 2
 * finish-to-finish: Task 1 must be finished to finish task 2
 */
export const taskSequenceType = [
  "start-to-start",
  "start-to-finish",
  "finish-to-start",
  "finish-to-finish",
] as const;

/**
 * references: Most relationships, just a connection to another task that might be worth noting
 * impacts: Used for tasks resulting in change orders
 * conflicts: Used for non-temporal conflicts like space, equipment, worker allocation
 */
export const taskRelationshipType = [
  "references",
  "impacts",
  "conflicts",
] as const;
