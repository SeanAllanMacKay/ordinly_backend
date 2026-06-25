import { and, eq, inArray, isNotNull, or } from "drizzle-orm";

import {
  db,
  User,
  Company,
  CompanyProject,
  Project,
  Task,
  TaskChecklistItem,
  TaskDocument,
  TaskRelationship,
  TaskSequence,
  UserTask,
  CompanyTask,
  TaskStatus,
  TaskPriority,
  ProjectClient,
  ProjectDocument,
  ProjectLocation,
  UserProject,
  ProjectRole,
  ProjectRolePermission,
  CompanyProjectRole,
  ProjectStatus,
  ProjectPriority,
  Client,
  Contact,
  UserClient,
  PhoneNumber,
  EmailAddress,
  Location,
  Reminder,
  Notification,
  NotificationDelivery,
  Team,
  TeamMember,
  CompanyRole,
  CompanyRolePermission,
  CompanyInvitation,
  UserCompanyRole,
  CompanyProfile,
  CompanyProfileAlbum,
  CompanyProfileAlbumImage,
  CompanyProfileDocument,
  CompanyProfileInfoList,
  CompanyProfileInfoListItem,
  CompanyProfileEmail,
  CompanyProfileLocation,
  CompanyProfilePhoneNumber,
  CompanyProfileWebsite,
  CompanyProfileHoursOfOperation,
  CompanyDocument,
  CompanyPaymentMethod,
  UserDocument,
  CompanySubscription,
  UserCompany,
} from "../../index.js";

export type HardDeleteAccountProps = {
  userId: string;
};

/**
 * Permanently erase a soft-deleted account once the 30-day grace window has
 * elapsed. Physically deletes the user's personal company and its entire asset
 * tree in FK-safe child→parent order, drops every company membership, and then
 * ANONYMISES the user row rather than deleting it: the user may have authored
 * content (createdBy, etc.) in other people's companies that must survive, and
 * those FKs forbid removing the row outright. Anonymising scrubs all PII and
 * makes login impossible, so the account is unrecoverable.
 *
 * Caller (handler) guards that the user is still soft-deleted before invoking —
 * a restore during the window clears `deletedDate`, making this a no-op.
 *
 * NOTE: backing files in Backblaze (Document rows kept, owned by the anonymised
 * user) are not purged here; file cleanup is a separate follow-up.
 */
export const hardDeleteAccount = async ({ userId }: HardDeleteAccountProps) => {
  return await db.transaction(async (tx) => {
    // Lock the user row and re-check soft-delete state inside the transaction.
    // Closes the race with a concurrent restore-on-login: if the account was
    // revived first, deletedDate is now null and we abort before deleting
    // anything (the empty transaction rolls back harmlessly).
    const [locked] = await tx
      .select({ deletedDate: User.deletedDate })
      .from(User)
      .where(eq(User.id, userId))
      .for("update");
    if (!locked || !locked.deletedDate) return undefined;

    const ids = async (rows: PromiseLike<{ id: string }[]>) =>
      (await rows).map((r) => r.id);

    // Personal company (already soft-deleted, so don't filter on deletedDate).
    const personal = await tx.query.Company.findFirst({
      where: and(eq(Company.owner, userId), eq(Company.isPersonal, true)),
      columns: { id: true },
    });
    const companyId = personal?.id;

    if (companyId) {
      const projectIds = await ids(
        tx
          .select({ id: CompanyProject.projectId })
          .from(CompanyProject)
          .where(eq(CompanyProject.companyId, companyId)),
      );
      const taskIds = projectIds.length
        ? await ids(
            tx
              .select({ id: Task.id })
              .from(Task)
              .where(inArray(Task.projectId, projectIds)),
          )
        : [];
      const clientIds = await ids(
        tx
          .select({ id: Client.id })
          .from(Client)
          .where(eq(Client.companyId, companyId)),
      );
      const contactIds = await ids(
        tx
          .select({ id: Contact.id })
          .from(Contact)
          .where(eq(Contact.companyId, companyId)),
      );
      const teamIds = await ids(
        tx
          .select({ id: Team.id })
          .from(Team)
          .where(eq(Team.companyId, companyId)),
      );
      const roleIds = await ids(
        tx
          .select({ id: CompanyRole.id })
          .from(CompanyRole)
          .where(eq(CompanyRole.companyId, companyId)),
      );
      const companyProjectIds = await ids(
        tx
          .select({ id: CompanyProject.id })
          .from(CompanyProject)
          .where(eq(CompanyProject.companyId, companyId)),
      );
      const projectRoleIds = await ids(
        tx
          .select({ id: ProjectRole.id })
          .from(ProjectRole)
          .where(
            projectIds.length
              ? or(
                  eq(ProjectRole.companyId, companyId),
                  inArray(ProjectRole.projectId, projectIds),
                )
              : eq(ProjectRole.companyId, companyId),
          ),
      );
      const profileIds = await ids(
        tx
          .select({ id: CompanyProfile.id })
          .from(CompanyProfile)
          .where(eq(CompanyProfile.companyId, companyId)),
      );
      const albumIds = profileIds.length
        ? await ids(
            tx
              .select({ id: CompanyProfileAlbum.id })
              .from(CompanyProfileAlbum)
              .where(inArray(CompanyProfileAlbum.companyProfileId, profileIds)),
          )
        : [];
      const infoListIds = profileIds.length
        ? await ids(
            tx
              .select({ id: CompanyProfileInfoList.id })
              .from(CompanyProfileInfoList)
              .where(
                inArray(CompanyProfileInfoList.companyProfileId, profileIds),
              ),
          )
        : [];

      // --- Task subtree ---
      if (taskIds.length) {
        await tx
          .delete(TaskChecklistItem)
          .where(inArray(TaskChecklistItem.taskId, taskIds));
        await tx
          .delete(TaskDocument)
          .where(inArray(TaskDocument.taskId, taskIds));
        await tx
          .delete(TaskRelationship)
          .where(
            or(
              inArray(TaskRelationship.fromId, taskIds),
              inArray(TaskRelationship.toId, taskIds),
            ),
          );
        await tx
          .delete(TaskSequence)
          .where(
            or(
              inArray(TaskSequence.predecessorId, taskIds),
              inArray(TaskSequence.successorId, taskIds),
            ),
          );
        await tx.delete(UserTask).where(inArray(UserTask.taskId, taskIds));
        await tx.delete(CompanyTask).where(inArray(CompanyTask.taskId, taskIds));
        await tx.delete(Task).where(inArray(Task.id, taskIds));
      }
      // Company-scoped task catalogs (now unreferenced by deleted tasks).
      await tx.delete(TaskStatus).where(eq(TaskStatus.companyId, companyId));
      await tx.delete(TaskPriority).where(eq(TaskPriority.companyId, companyId));

      // --- Project subtree ---
      if (projectIds.length) {
        await tx
          .delete(ProjectClient)
          .where(inArray(ProjectClient.projectId, projectIds));
        await tx
          .delete(ProjectDocument)
          .where(inArray(ProjectDocument.projectId, projectIds));
        await tx
          .delete(ProjectLocation)
          .where(inArray(ProjectLocation.projectId, projectIds));
        await tx
          .delete(UserProject)
          .where(inArray(UserProject.projectId, projectIds));
      }
      if (projectRoleIds.length) {
        await tx
          .delete(ProjectRolePermission)
          .where(inArray(ProjectRolePermission.roleId, projectRoleIds));
      }
      if (companyProjectIds.length || projectRoleIds.length) {
        await tx
          .delete(CompanyProjectRole)
          .where(
            or(
              companyProjectIds.length
                ? inArray(CompanyProjectRole.companyProjectId, companyProjectIds)
                : undefined,
              projectRoleIds.length
                ? inArray(CompanyProjectRole.roleId, projectRoleIds)
                : undefined,
            ),
          );
      }
      if (projectRoleIds.length) {
        await tx.delete(ProjectRole).where(inArray(ProjectRole.id, projectRoleIds));
      }
      await tx
        .delete(CompanyProject)
        .where(eq(CompanyProject.companyId, companyId));
      if (projectIds.length) {
        await tx.delete(Project).where(inArray(Project.id, projectIds));
      }
      await tx
        .delete(ProjectStatus)
        .where(eq(ProjectStatus.companyId, companyId));
      await tx
        .delete(ProjectPriority)
        .where(eq(ProjectPriority.companyId, companyId));

      // --- Client subtree + polymorphic contact info ---
      if (clientIds.length || contactIds.length) {
        if (clientIds.length) {
          await tx
            .delete(PhoneNumber)
            .where(
              and(
                eq(PhoneNumber.ownerType, "client"),
                inArray(PhoneNumber.ownerId, clientIds),
              ),
            );
          await tx
            .delete(EmailAddress)
            .where(
              and(
                eq(EmailAddress.ownerType, "client"),
                inArray(EmailAddress.ownerId, clientIds),
              ),
            );
          await tx
            .delete(Location)
            .where(
              and(
                eq(Location.ownerType, "client"),
                inArray(Location.ownerId, clientIds),
              ),
            );
          await tx.delete(UserClient).where(inArray(UserClient.clientId, clientIds));
        }
        if (contactIds.length) {
          await tx
            .delete(PhoneNumber)
            .where(
              and(
                eq(PhoneNumber.ownerType, "contact"),
                inArray(PhoneNumber.ownerId, contactIds),
              ),
            );
          await tx
            .delete(EmailAddress)
            .where(
              and(
                eq(EmailAddress.ownerType, "contact"),
                inArray(EmailAddress.ownerId, contactIds),
              ),
            );
          await tx
            .delete(Location)
            .where(
              and(
                eq(Location.ownerType, "contact"),
                inArray(Location.ownerId, contactIds),
              ),
            );
        }
      }
      await tx.delete(Contact).where(eq(Contact.companyId, companyId));
      await tx.delete(Client).where(eq(Client.companyId, companyId));

      // --- Reminders, notifications, teams ---
      await tx.delete(Reminder).where(eq(Reminder.companyId, companyId));
      if (teamIds.length) {
        await tx.delete(TeamMember).where(inArray(TeamMember.teamId, teamIds));
      }
      await tx.delete(Team).where(eq(Team.companyId, companyId));

      // --- Roles / invitations ---
      if (roleIds.length) {
        await tx
          .delete(CompanyRolePermission)
          .where(inArray(CompanyRolePermission.roleId, roleIds));
        await tx
          .delete(UserCompanyRole)
          .where(inArray(UserCompanyRole.roleId, roleIds));
      }
      await tx
        .delete(CompanyInvitation)
        .where(eq(CompanyInvitation.companyId, companyId));
      await tx.delete(CompanyRole).where(eq(CompanyRole.companyId, companyId));

      // --- Company profile subtree ---
      if (albumIds.length) {
        await tx
          .delete(CompanyProfileAlbumImage)
          .where(inArray(CompanyProfileAlbumImage.companyProfileAlbumId, albumIds));
      }
      if (infoListIds.length) {
        await tx
          .delete(CompanyProfileInfoListItem)
          .where(
            inArray(CompanyProfileInfoListItem.companyProfilInfoListId, infoListIds),
          );
      }
      if (profileIds.length) {
        await tx
          .delete(CompanyProfileAlbum)
          .where(inArray(CompanyProfileAlbum.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileDocument)
          .where(inArray(CompanyProfileDocument.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileInfoList)
          .where(inArray(CompanyProfileInfoList.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileEmail)
          .where(inArray(CompanyProfileEmail.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileLocation)
          .where(inArray(CompanyProfileLocation.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfilePhoneNumber)
          .where(inArray(CompanyProfilePhoneNumber.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileWebsite)
          .where(inArray(CompanyProfileWebsite.companyProfileId, profileIds));
        await tx
          .delete(CompanyProfileHoursOfOperation)
          .where(inArray(CompanyProfileHoursOfOperation.companyProfileId, profileIds));
      }
      await tx
        .delete(CompanyProfile)
        .where(eq(CompanyProfile.companyId, companyId));

      // --- Company documents / payment / subscription ---
      await tx
        .delete(CompanyDocument)
        .where(eq(CompanyDocument.companyId, companyId));
      await tx
        .delete(CompanyPaymentMethod)
        .where(eq(CompanyPaymentMethod.companyId, companyId));
      await tx
        .delete(CompanySubscription)
        .where(eq(CompanySubscription.companyId, companyId));
    }

    // --- User-scoped rows that span any company ---
    await tx
      .delete(NotificationDelivery)
      .where(eq(NotificationDelivery.recipientUserId, userId));
    await tx.delete(Notification).where(eq(Notification.userId, userId));
    await tx.delete(TeamMember).where(eq(TeamMember.userId, userId));
    await tx.delete(UserDocument).where(eq(UserDocument.userId, userId));

    // Drop every membership + role assignment for the user.
    const membershipIds = await tx
      .select({ id: UserCompany.id })
      .from(UserCompany)
      .where(eq(UserCompany.userId, userId))
      .then((rows) => rows.map((r) => r.id));
    if (membershipIds.length) {
      await tx
        .delete(UserCompanyRole)
        .where(inArray(UserCompanyRole.userCompanyId, membershipIds));
    }
    await tx.delete(UserCompany).where(eq(UserCompany.userId, userId));

    // Remove the (now empty) personal company shell.
    if (companyId) {
      await tx.delete(Company).where(eq(Company.id, companyId));
    }

    // --- Anonymise the user row (kept for surviving cross-company authorship) ---
    const [user] = await tx
      .update(User)
      .set({
        name: "Deleted user",
        email: `deleted+${userId}@deleted.invalid`,
        password: "",
        isVerified: false,
        hardDeleteJobId: null,
      })
      .where(and(eq(User.id, userId), isNotNull(User.deletedDate)))
      .returning();

    return user;
  });
};
