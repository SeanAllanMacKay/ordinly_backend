import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  resolveCompanyPermissions,
  isUserAssignedToProject,
  isUserAssignedToTask,
  isUserAssignedToClient,
  CompanyPermissionKey,
  PermissionBits,
} from "../../services/db/index.js";

export type PermissionAction = keyof PermissionBits; // create | read | update | delete

const forbidden = (message = "You don't have permission to perform this action") => ({
  status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
  error: [message],
});

const notFound = (message = "Company not found") => ({
  status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
  error: [message],
});

/**
 * The all_/assigned_ permission-key pair and assignment lookup for each
 * asset scope. "checklist" assignment is resolved against the parent task,
 * so callers pass the parent task id as `assetId`.
 */
const ASSET_KEYS = {
  client: { all: "all_clients", assigned: "assigned_clients" },
  project: { all: "all_projects", assigned: "assigned_projects" },
  task: { all: "all_tasks", assigned: "assigned_tasks" },
  checklist: { all: "all_checklist_items", assigned: "assigned_checklist_items" },
} as const;

export type AssetScope = keyof typeof ASSET_KEYS;

/**
 * Assert a single-key company permission (collection / management permissions
 * such as workers, roles, company_settings, *_documents). Owner-bypass applies.
 * Throws { status, error } in the action error convention on denial.
 */
export const assertCompanyPermission = async ({
  userId,
  companyId,
  key,
  action,
}: {
  userId: string;
  companyId: string;
  key: CompanyPermissionKey;
  action: PermissionAction;
}) => {
  const { exists, isOwner, permissions } = await resolveCompanyPermissions({
    userId,
    companyId,
  });

  if (!exists) throw notFound();
  if (isOwner) return;
  if (permissions[key]?.[action]) return;

  throw forbidden();
};

/**
 * Assert a two-tier asset permission: allow if the user has the all_* bit for
 * the action, OR is assigned to the specific asset AND has the assigned_* bit.
 * Owner-bypass applies. `assetId` is the project/task id (for "checklist", the
 * parent task id).
 */
export const assertCompanyAssetPermission = async ({
  userId,
  companyId,
  scope,
  assetId,
  action,
}: {
  userId: string;
  companyId: string;
  scope: AssetScope;
  assetId: string;
  action: PermissionAction;
}) => {
  const { exists, isOwner, permissions } = await resolveCompanyPermissions({
    userId,
    companyId,
  });

  if (!exists) throw notFound();
  if (isOwner) return;

  const { all, assigned } = ASSET_KEYS[scope];

  if (permissions[all]?.[action]) return;

  if (permissions[assigned]?.[action]) {
    const isAssigned =
      scope === "client"
        ? await isUserAssignedToClient({ userId, clientId: assetId })
        : scope === "project"
          ? await isUserAssignedToProject({ userId, projectId: assetId })
          : await isUserAssignedToTask({ userId, taskId: assetId });

    if (isAssigned) return;
  }

  throw forbidden();
};

/**
 * Assert the user is the company owner. Unlike assertCompanyPermission this has
 * no permission-bit fallback — only the owner passes. Used for destructive,
 * company-wide actions such as deleting the company.
 */
export const assertCompanyOwner = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) => {
  const { exists, isOwner } = await resolveCompanyPermissions({
    userId,
    companyId,
  });

  if (!exists) throw notFound();
  if (!isOwner) throw forbidden();
};

/**
 * Block actions that only make sense with multiple members (inviting workers,
 * managing roles) on a personal company.
 */
export const assertNotPersonalCompany = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) => {
  const { exists, isPersonal } = await resolveCompanyPermissions({
    userId,
    companyId,
  });

  if (!exists) throw notFound();
  if (isPersonal)
    throw forbidden("This action isn't available for personal companies");
};
