// Response-body types for the OpenAPI docs, derived from the actual action
// return types. The router strips `status` from the action result before
// `res.send(...)`, so the documented body is `Omit<…, "status">`. Where a router
// adds keys not present on the action result (e.g. `page`), intersect them on;
// for the few inline handlers (no action) the type is written out by hand.
//
// `RESPONSE_TYPE_MAP` keys MUST match buildSpec's `${METHOD} ${openApiPath}`
// route key exactly (uppercase method, `{param}` path segments). Each mapped
// type name is generated into `components.schemas` by responseSchemas.ts and
// referenced from the route's success response. `status` overrides the
// method-derived default (POST→201, PUT/PATCH→202, GET/DELETE→200) for the
// actions whose returned status deviates from it.

import type {
  // user
  deleteAccount,
  login,
  signUp,
  verifyAccount,
  resendVerification,
  getUserById,
  // task metadata
  listTaskPriorities,
  listTaskStatuses,
  // projects
  listProjects,
  createProject,
  listProjectOptions,
  listProjectPriorities,
  listProjectStatuses,
  getProject,
  updateProject,
  deleteProject,
  // project tasks
  listTaskOptions,
  listProjectTasks,
  createProjectTask,
  getProjectTask,
  updateProjectTask,
  deleteProjectTask,
  updateProjectTaskChecklist,
  // phases / milestones
  listPhaseOptions,
  listMilestoneOptions,
  // roles
  listPermissionCatalog,
  listCompanyRoles,
  createCompanyRole,
  getCompanyRole,
  updateCompanyRole,
  deleteCompanyRole,
  getRolePermissions,
  updateRolePermissions,
  // members
  listMemberOptions,
  listCompanyMembers,
  inviteUser,
  getCompanyMember,
  updateMemberRoles,
  removeCompanyMember,
  // teams
  listTeamOptions,
  listTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  // clients
  listClients,
  listClientOptions,
  createClient,
  getClient,
  updateClient,
  deleteClient,
  // contacts
  listContacts,
  listContactOptions,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  // invitations
  listCompanyInvitations,
  revokeCompanyInvitation,
  // notifications
  listNotifications,
  markNotificationRead,
  // reminders
  listReminders,
  createReminder,
  updateReminder,
  cancelReminder,
} from "../../actions/index.js";

// Not re-exported from the actions barrel — import directly.
import type { listCompanies } from "../../actions/company/listCompanies.js";
import type { createCompany } from "../../actions/company/createCompany.js";
import type { getCompany } from "../../actions/company/getCompany.js";
import type { deleteCompany } from "../../actions/company/deleteCompany.js";
import type { getProjectTaskDocument } from "../../actions/projects/getProjectTaskDocument.js";

type ApiBody<F extends (...args: any) => any> = Omit<
  Awaited<ReturnType<F>>,
  "status"
>;

/* ---- User / auth ---- */
export type CurrentUserResponse = {
  message: string;
  user: Awaited<ReturnType<typeof getUserById>>["user"];
};
export type DeleteAccountResponse = ApiBody<typeof deleteAccount>;
export type LoginResponse = ApiBody<typeof login>;
export type SignUpResponse = ApiBody<typeof signUp>;
export type LogoutResponse = { message: string };
export type VerifyAccountResponse = ApiBody<typeof verifyAccount>;
export type ResendVerificationResponse = ApiBody<typeof resendVerification>;

/* ---- Task metadata ---- */
export type ListTaskPrioritiesResponse = ApiBody<typeof listTaskPriorities>;
export type ListTaskStatusesResponse = ApiBody<typeof listTaskStatuses>;

/* ---- File / image metadata (inline handlers) ---- */
export type FileMetadataResponse = {
  message: string;
  maxFileSize: number;
  acceptedFileTypes: string[];
  maxFiles: number;
};

/* ---- Company ---- */
export type ListCompaniesResponse = ApiBody<typeof listCompanies>;
export type CreateCompanyResponse = ApiBody<typeof createCompany>;
export type GetCompanyResponse = ApiBody<typeof getCompany>;
export type DeleteCompanyResponse = ApiBody<typeof deleteCompany>;

/* ---- Projects ---- */
export type ListProjectsResponse = ApiBody<typeof listProjects> & {
  page: number; // router adds page from the query param
};
export type CreateProjectResponse = ApiBody<typeof createProject>;
export type ListProjectOptionsResponse = ApiBody<typeof listProjectOptions>;
export type ListProjectPrioritiesResponse = ApiBody<
  typeof listProjectPriorities
>;
export type ListProjectStatusesResponse = ApiBody<typeof listProjectStatuses>;
export type GetProjectResponse = ApiBody<typeof getProject>;
export type UpdateProjectResponse = ApiBody<typeof updateProject>;
export type DeleteProjectResponse = ApiBody<typeof deleteProject>;

/* ---- Project tasks ---- */
export type ListTaskOptionsResponse = ApiBody<typeof listTaskOptions>;
export type ListProjectTasksResponse = ApiBody<typeof listProjectTasks>;
export type CreateProjectTaskResponse = ApiBody<typeof createProjectTask>;
export type GetProjectTaskResponse = ApiBody<typeof getProjectTask>;
export type UpdateProjectTaskResponse = ApiBody<typeof updateProjectTask>;
export type DeleteProjectTaskResponse = ApiBody<typeof deleteProjectTask>;
export type UpdateProjectTaskChecklistResponse = ApiBody<
  typeof updateProjectTaskChecklist
>;
export type GetProjectTaskDocumentResponse = ApiBody<
  typeof getProjectTaskDocument
>;

/* ---- Phases / milestones ---- */
export type ListPhaseOptionsResponse = ApiBody<typeof listPhaseOptions>;
export type ListMilestoneOptionsResponse = ApiBody<typeof listMilestoneOptions>;

/* ---- Roles ---- */
export type ListPermissionCatalogResponse = ApiBody<
  typeof listPermissionCatalog
>;
export type ListCompanyRolesResponse = ApiBody<typeof listCompanyRoles>;
export type CreateCompanyRoleResponse = ApiBody<typeof createCompanyRole>;
export type GetCompanyRoleResponse = ApiBody<typeof getCompanyRole>;
export type UpdateCompanyRoleResponse = ApiBody<typeof updateCompanyRole>;
export type DeleteCompanyRoleResponse = ApiBody<typeof deleteCompanyRole>;
export type GetRolePermissionsResponse = ApiBody<typeof getRolePermissions>;
export type UpdateRolePermissionsResponse = ApiBody<
  typeof updateRolePermissions
>;

/* ---- Members ---- */
export type ListMemberOptionsResponse = ApiBody<typeof listMemberOptions>;
export type ListCompanyMembersResponse = ApiBody<typeof listCompanyMembers>;
export type InviteUserResponse = ApiBody<typeof inviteUser>;
export type GetCompanyMemberResponse = ApiBody<typeof getCompanyMember>;
export type UpdateMemberRolesResponse = ApiBody<typeof updateMemberRoles>;
export type RemoveCompanyMemberResponse = ApiBody<typeof removeCompanyMember>;

/* ---- Teams ---- */
export type ListTeamOptionsResponse = ApiBody<typeof listTeamOptions>;
export type ListTeamsResponse = ApiBody<typeof listTeams>;
export type CreateTeamResponse = ApiBody<typeof createTeam>;
export type GetTeamResponse = ApiBody<typeof getTeam>;
export type UpdateTeamResponse = ApiBody<typeof updateTeam>;
export type DeleteTeamResponse = ApiBody<typeof deleteTeam>;

/* ---- Clients ---- */
export type ListClientsResponse = ApiBody<typeof listClients>;
export type ListClientOptionsResponse = ApiBody<typeof listClientOptions>;
export type CreateClientResponse = ApiBody<typeof createClient>;
export type GetClientResponse = ApiBody<typeof getClient>;
export type UpdateClientResponse = ApiBody<typeof updateClient>;
export type DeleteClientResponse = ApiBody<typeof deleteClient>;

/* ---- Contacts ---- */
export type ListContactsResponse = ApiBody<typeof listContacts>;
export type ListContactOptionsResponse = ApiBody<typeof listContactOptions>;
export type CreateContactResponse = ApiBody<typeof createContact>;
export type GetContactResponse = ApiBody<typeof getContact>;
export type UpdateContactResponse = ApiBody<typeof updateContact>;
export type DeleteContactResponse = ApiBody<typeof deleteContact>;

/* ---- Invitations ---- */
export type ListCompanyInvitationsResponse = ApiBody<
  typeof listCompanyInvitations
>;
export type RevokeCompanyInvitationResponse = ApiBody<
  typeof revokeCompanyInvitation
>;

/* ---- Notifications ---- */
export type ListNotificationsResponse = ApiBody<typeof listNotifications>;
export type MarkNotificationReadResponse = ApiBody<typeof markNotificationRead>;

/* ---- Reminders ---- */
export type ListRemindersResponse = ApiBody<typeof listReminders>;
export type CreateReminderResponse = ApiBody<typeof createReminder>;
export type UpdateReminderResponse = ApiBody<typeof updateReminder>;
export type CancelReminderResponse = ApiBody<typeof cancelReminder>;

export type ResponseTypeEntry = { type: string; status?: number };

export const RESPONSE_TYPE_MAP: Record<string, ResponseTypeEntry> = {
  // User / auth
  "GET /api/user": { type: "CurrentUserResponse" },
  "DELETE /api/user": { type: "DeleteAccountResponse" },
  "POST /api/user/login": { type: "LoginResponse", status: 200 },
  "POST /api/user/sign-up": { type: "SignUpResponse" },
  "POST /api/user/logout": { type: "LogoutResponse", status: 200 },
  "POST /api/user/verify-account": {
    type: "VerifyAccountResponse",
    status: 202,
  },
  "POST /api/user/resend-verification": {
    type: "ResendVerificationResponse",
    status: 200,
  },

  // Task metadata
  "GET /api/task/priority": { type: "ListTaskPrioritiesResponse" },
  "GET /api/task/status": { type: "ListTaskStatusesResponse" },

  // File / image metadata
  "GET /api/metadata/file": { type: "FileMetadataResponse" },
  "GET /api/metadata/image": { type: "FileMetadataResponse" },

  // Company
  "GET /api/company": { type: "ListCompaniesResponse" },
  "POST /api/company": { type: "CreateCompanyResponse" },
  "GET /api/company/{companyId}": { type: "GetCompanyResponse" },
  "DELETE /api/company/{companyId}": { type: "DeleteCompanyResponse" },

  // Projects
  "GET /api/company/{companyId}/projects": { type: "ListProjectsResponse" },
  "POST /api/company/{companyId}/projects": { type: "CreateProjectResponse" },
  "GET /api/company/{companyId}/projects/options": {
    type: "ListProjectOptionsResponse",
  },
  "GET /api/company/{companyId}/projects/priority": {
    type: "ListProjectPrioritiesResponse",
  },
  "GET /api/company/{companyId}/projects/status": {
    type: "ListProjectStatusesResponse",
  },
  "GET /api/company/{companyId}/projects/{projectId}": {
    type: "GetProjectResponse",
  },
  "PUT /api/company/{companyId}/projects/{projectId}": {
    type: "UpdateProjectResponse",
  },
  "DELETE /api/company/{companyId}/projects/{projectId}": {
    type: "DeleteProjectResponse",
  },

  // Project tasks
  "GET /api/company/{companyId}/projects/{projectId}/tasks/options": {
    type: "ListTaskOptionsResponse",
  },
  "GET /api/company/{companyId}/projects/{projectId}/tasks": {
    type: "ListProjectTasksResponse",
  },
  "POST /api/company/{companyId}/projects/{projectId}/tasks": {
    type: "CreateProjectTaskResponse",
  },
  "GET /api/company/{companyId}/projects/{projectId}/tasks/{taskId}": {
    type: "GetProjectTaskResponse",
  },
  "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}": {
    type: "UpdateProjectTaskResponse",
  },
  "DELETE /api/company/{companyId}/projects/{projectId}/tasks/{taskId}": {
    type: "DeleteProjectTaskResponse",
  },
  "PUT /api/company/{companyId}/projects/{projectId}/tasks/{taskId}/checklist": {
    type: "UpdateProjectTaskChecklistResponse",
  },
  "GET /api/company/{companyId}/projects/{projectId}/tasks/{taskId}/documents/{documentId}/download-url":
    { type: "GetProjectTaskDocumentResponse" },

  // Phases / milestones
  "GET /api/company/{companyId}/projects/{projectId}/phases/options": {
    type: "ListPhaseOptionsResponse",
  },
  "GET /api/company/{companyId}/projects/{projectId}/milestones/options": {
    type: "ListMilestoneOptionsResponse",
  },

  // Roles
  "GET /api/company/{companyId}/roles/catalog": {
    type: "ListPermissionCatalogResponse",
  },
  "GET /api/company/{companyId}/roles": { type: "ListCompanyRolesResponse" },
  "POST /api/company/{companyId}/roles": { type: "CreateCompanyRoleResponse" },
  "GET /api/company/{companyId}/roles/{roleId}": {
    type: "GetCompanyRoleResponse",
  },
  "PUT /api/company/{companyId}/roles/{roleId}": {
    type: "UpdateCompanyRoleResponse",
  },
  "DELETE /api/company/{companyId}/roles/{roleId}": {
    type: "DeleteCompanyRoleResponse",
  },
  "GET /api/company/{companyId}/roles/{roleId}/permissions": {
    type: "GetRolePermissionsResponse",
  },
  "PUT /api/company/{companyId}/roles/{roleId}/permissions": {
    type: "UpdateRolePermissionsResponse",
  },

  // Members
  "GET /api/company/{companyId}/users/options": {
    type: "ListMemberOptionsResponse",
  },
  "GET /api/company/{companyId}/users": { type: "ListCompanyMembersResponse" },
  "POST /api/company/{companyId}/users": { type: "InviteUserResponse" },
  "GET /api/company/{companyId}/users/{userId}": {
    type: "GetCompanyMemberResponse",
  },
  "PUT /api/company/{companyId}/users/{userId}": {
    type: "UpdateMemberRolesResponse",
  },
  "DELETE /api/company/{companyId}/users/{userId}": {
    type: "RemoveCompanyMemberResponse",
  },

  // Teams
  "GET /api/company/{companyId}/teams/options": {
    type: "ListTeamOptionsResponse",
  },
  "GET /api/company/{companyId}/teams": { type: "ListTeamsResponse" },
  "POST /api/company/{companyId}/teams": { type: "CreateTeamResponse" },
  "GET /api/company/{companyId}/teams/{teamId}": { type: "GetTeamResponse" },
  "PUT /api/company/{companyId}/teams/{teamId}": { type: "UpdateTeamResponse" },
  "DELETE /api/company/{companyId}/teams/{teamId}": {
    type: "DeleteTeamResponse",
  },

  // Clients
  "GET /api/company/{companyId}/clients/options": {
    type: "ListClientOptionsResponse",
  },
  "GET /api/company/{companyId}/clients": { type: "ListClientsResponse" },
  "POST /api/company/{companyId}/clients": { type: "CreateClientResponse" },
  "GET /api/company/{companyId}/clients/{clientId}": {
    type: "GetClientResponse",
  },
  "PUT /api/company/{companyId}/clients/{clientId}": {
    type: "UpdateClientResponse",
  },
  "DELETE /api/company/{companyId}/clients/{clientId}": {
    type: "DeleteClientResponse",
  },

  // Contacts
  "GET /api/company/{companyId}/clients/{clientId}/contacts/options": {
    type: "ListContactOptionsResponse",
  },
  "GET /api/company/{companyId}/clients/{clientId}/contacts": {
    type: "ListContactsResponse",
  },
  "POST /api/company/{companyId}/clients/{clientId}/contacts": {
    type: "CreateContactResponse",
  },
  "GET /api/company/{companyId}/clients/{clientId}/contacts/{contactId}": {
    type: "GetContactResponse",
  },
  "PUT /api/company/{companyId}/clients/{clientId}/contacts/{contactId}": {
    type: "UpdateContactResponse",
  },
  "DELETE /api/company/{companyId}/clients/{clientId}/contacts/{contactId}": {
    type: "DeleteContactResponse",
  },

  // Invitations
  "GET /api/company/{companyId}/invitations": {
    type: "ListCompanyInvitationsResponse",
  },
  "DELETE /api/company/{companyId}/invitations/{invitationId}": {
    type: "RevokeCompanyInvitationResponse",
  },

  // Notifications
  "GET /api/company/{companyId}/notifications": {
    type: "ListNotificationsResponse",
  },
  "PATCH /api/company/{companyId}/notifications/{notificationId}/read": {
    type: "MarkNotificationReadResponse",
    status: 200,
  },

  // Reminders
  "GET /api/company/{companyId}/reminders": { type: "ListRemindersResponse" },
  "POST /api/company/{companyId}/reminders": { type: "CreateReminderResponse" },
  "PATCH /api/company/{companyId}/reminders/{reminderId}": {
    type: "UpdateReminderResponse",
    status: 200,
  },
  "DELETE /api/company/{companyId}/reminders/{reminderId}": {
    type: "CancelReminderResponse",
  },
};
