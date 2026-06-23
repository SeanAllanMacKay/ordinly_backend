import { and, eq, isNull } from "drizzle-orm";

import {
  db,
  Company,
  CompanyProject,
  Task,
  UserCompany,
  UserCompanyRole,
  CompanyRolePermission,
  CompanyPermission,
  CompanyPermissionLevel,
  UserProject,
  UserTask,
} from "../../index.js";
import { companyRolePermissionAction } from "../../constants.js";

export type CompanyPermissionKey = (typeof companyRolePermissionAction)[number];

export type PermissionBits = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type ResolvedCompanyPermissions = {
  /** Company exists (and is not soft-deleted). */
  exists: boolean;
  /** The user owns the company — bypasses RBAC entirely. */
  isOwner: boolean;
  /** The company is the user's (or someone's) personal company. */
  isPersonal: boolean;
  /** Effective CRUD bits per permission key, OR-unioned across the user's roles. */
  permissions: Record<string, PermissionBits>;
};

const EMPTY_BITS: PermissionBits = {
  create: false,
  read: false,
  update: false,
  delete: false,
};

/**
 * Resolves a user's effective company-scoped permissions. This is the single
 * source of truth for "what can user U do in company C". Owner-bypass is baked
 * in (Company.owner is authorized outside RBAC, per the seeded role catalog).
 *
 * The returned `permissions` map is keyed by CompanyPermission.key (e.g.
 * "all_projects") and unions the CRUD bits granted by every role the user holds
 * in the company.
 */
export const resolveCompanyPermissions = async ({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}): Promise<ResolvedCompanyPermissions> => {
  const company = await db.query.Company.findFirst({
    where: and(eq(Company.id, companyId), isNull(Company.deletedDate)),
    columns: { id: true, owner: true, isPersonal: true },
  });

  if (!company) {
    return {
      exists: false,
      isOwner: false,
      isPersonal: false,
      permissions: {},
    };
  }

  // Flat join across the role-assignment chain: the user's (non-deleted) roles
  // in the company → their (non-deleted) permission assignments → the catalog
  // permission key and the granted CRUD level.
  const rows = await db
    .select({
      key: CompanyPermission.key,
      create: CompanyPermissionLevel.create,
      read: CompanyPermissionLevel.read,
      update: CompanyPermissionLevel.update,
      delete: CompanyPermissionLevel.delete,
    })
    .from(UserCompany)
    .innerJoin(
      UserCompanyRole,
      and(
        eq(UserCompanyRole.userCompanyId, UserCompany.id),
        isNull(UserCompanyRole.deletedDate),
      ),
    )
    .innerJoin(
      CompanyRolePermission,
      and(
        eq(CompanyRolePermission.roleId, UserCompanyRole.roleId),
        isNull(CompanyRolePermission.deletedDate),
      ),
    )
    .innerJoin(
      CompanyPermission,
      eq(CompanyPermission.id, CompanyRolePermission.permissionId),
    )
    .innerJoin(
      CompanyPermissionLevel,
      eq(CompanyPermissionLevel.id, CompanyRolePermission.levelId),
    )
    .where(
      and(
        eq(UserCompany.userId, userId),
        eq(UserCompany.companyId, companyId),
      ),
    );

  const permissions: Record<string, PermissionBits> = {};

  for (const row of rows) {
    const existing = permissions[row.key] ?? EMPTY_BITS;
    permissions[row.key] = {
      create: existing.create || row.create,
      read: existing.read || row.read,
      update: existing.update || row.update,
      delete: existing.delete || row.delete,
    };
  }

  return {
    exists: true,
    isOwner: company.owner === userId,
    isPersonal: company.isPersonal,
    permissions,
  };
};

/** Whether the user is directly assigned to the project (UserProject). */
export const isUserAssignedToProject = async ({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) => {
  const row = await db.query.UserProject.findFirst({
    where: and(
      eq(UserProject.userId, userId),
      eq(UserProject.projectId, projectId),
    ),
    columns: { id: true },
  });

  return !!row;
};

/** Whether the user is directly assigned to the task (UserTask). */
export const isUserAssignedToTask = async ({
  userId,
  taskId,
}: {
  userId: string;
  taskId: string;
}) => {
  const row = await db.query.UserTask.findFirst({
    where: and(eq(UserTask.userId, userId), eq(UserTask.taskId, taskId)),
    columns: { id: true },
  });

  return !!row;
};

/** Integrity: the project belongs to the company (via CompanyProject). */
export const isProjectInCompany = async ({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}) => {
  const row = await db.query.CompanyProject.findFirst({
    where: and(
      eq(CompanyProject.projectId, projectId),
      eq(CompanyProject.companyId, companyId),
    ),
    columns: { id: true },
  });

  return !!row;
};

/** Integrity: the task belongs to the project, which belongs to the company. */
export const isTaskInProjectCompany = async ({
  taskId,
  projectId,
  companyId,
}: {
  taskId: string;
  projectId: string;
  companyId: string;
}) => {
  const row = await db.query.Task.findFirst({
    where: (task, { exists }) =>
      and(
        eq(task.id, taskId),
        eq(task.projectId, projectId),
        exists(
          db
            .select()
            .from(CompanyProject)
            .where(
              and(
                eq(CompanyProject.projectId, projectId),
                eq(CompanyProject.companyId, companyId),
              ),
            ),
        ),
      ),
    columns: { id: true },
  });

  return !!row;
};
