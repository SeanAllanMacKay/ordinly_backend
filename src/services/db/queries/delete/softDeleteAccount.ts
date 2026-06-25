import { and, eq, inArray, isNull, or } from "drizzle-orm";

import {
  db,
  User,
  Company,
  CompanyProject,
  Project,
  Task,
  TaskChecklistItem,
  Client,
  Contact,
  Reminder,
  Team,
  TeamMember,
  CompanyRole,
  CompanySubscription,
  Notification,
  UserCompany,
  UserCompanyRole,
} from "../../index.js";
import { softDeleteOwnedContactInfo } from "../util/ownedContactInfo.js";

export type SoftDeleteAccountProps = {
  userId: string;
};

/**
 * Soft-delete a user account and everything they own: their personal company
 * and its full asset tree (projects → tasks → checklist items, clients +
 * contacts + polymorphic contact info, reminders, teams, company roles,
 * subscription) plus the user's notifications and every company membership.
 *
 * Every row touched is stamped with the SAME `deletedDate` (and
 * `deletedBy = userId` on tables that have it). That `(deletedBy, deletedDate)`
 * pair is the batch key `restoreAccount` and `hardDeleteAccount` use to act on
 * exactly the rows this deletion touched — without disturbing entities the user
 * soft-deleted earlier for other reasons.
 *
 * Returns `{ user, deletedAt }` (with the batch timestamp), or `undefined` if
 * the user is missing or already soft-deleted. The caller schedules the 30-day
 * hard delete off `deletedAt`.
 */
export const softDeleteAccount = async ({ userId }: SoftDeleteAccountProps) => {
  return await db.transaction(async (tx) => {
    const now = new Date();
    const stamp = { deletedDate: now, deletedBy: userId };

    // 1. The user row itself (no deletedBy — it would always be its own id).
    const [user] = await tx
      .update(User)
      .set({ deletedDate: now })
      .where(and(eq(User.id, userId), isNull(User.deletedDate)))
      .returning();

    if (!user) return undefined;

    // 2. Resolve the user's personal company and its owned id sets.
    const personal = await tx.query.Company.findFirst({
      where: and(
        eq(Company.owner, userId),
        eq(Company.isPersonal, true),
        isNull(Company.deletedDate),
      ),
      columns: { id: true },
    });
    const companyId = personal?.id;

    if (companyId) {
      const projectRows = await tx
        .select({ projectId: CompanyProject.projectId })
        .from(CompanyProject)
        .where(
          and(
            eq(CompanyProject.companyId, companyId),
            eq(CompanyProject.isOwner, true),
          ),
        );
      const projectIds = projectRows
        .map((r) => r.projectId)
        .filter((id): id is string => Boolean(id));

      const taskRows = projectIds.length
        ? await tx
            .select({ id: Task.id })
            .from(Task)
            .where(inArray(Task.projectId, projectIds))
        : [];
      const taskIds = taskRows.map((r) => r.id);

      const clientRows = await tx
        .select({ id: Client.id })
        .from(Client)
        .where(
          and(eq(Client.companyId, companyId), isNull(Client.deletedDate)),
        );
      const clientIds = clientRows.map((r) => r.id);

      const contactRows = await tx
        .select({ id: Contact.id })
        .from(Contact)
        .where(
          and(eq(Contact.companyId, companyId), isNull(Contact.deletedDate)),
        );
      const contactIds = contactRows.map((r) => r.id);

      const teamRows = await tx
        .select({ id: Team.id })
        .from(Team)
        .where(and(eq(Team.companyId, companyId), isNull(Team.deletedDate)));
      const teamIds = teamRows.map((r) => r.id);

      // 3. Company + project/task tree.
      await tx
        .update(Company)
        .set(stamp)
        .where(and(eq(Company.id, companyId), isNull(Company.deletedDate)));

      if (taskIds.length) {
        await tx
          .update(TaskChecklistItem)
          .set(stamp)
          .where(
            and(
              inArray(TaskChecklistItem.taskId, taskIds),
              isNull(TaskChecklistItem.deletedDate),
            ),
          );
      }
      if (projectIds.length) {
        await tx
          .update(Task)
          .set(stamp)
          .where(
            and(inArray(Task.projectId, projectIds), isNull(Task.deletedDate)),
          );
        await tx
          .update(Project)
          .set(stamp)
          .where(
            and(inArray(Project.id, projectIds), isNull(Project.deletedDate)),
          );
      }

      // 4. Clients, contacts, polymorphic contact info.
      await tx
        .update(Client)
        .set(stamp)
        .where(
          and(eq(Client.companyId, companyId), isNull(Client.deletedDate)),
        );
      await tx
        .update(Contact)
        .set(stamp)
        .where(
          and(eq(Contact.companyId, companyId), isNull(Contact.deletedDate)),
        );
      await softDeleteOwnedContactInfo(tx, {
        ownerType: "client",
        ownerIds: clientIds,
        userId,
      });
      await softDeleteOwnedContactInfo(tx, {
        ownerType: "contact",
        ownerIds: contactIds,
        userId,
      });

      // 5. Reminders, teams, roles, subscription.
      await tx
        .update(Reminder)
        .set(stamp)
        .where(
          and(eq(Reminder.companyId, companyId), isNull(Reminder.deletedDate)),
        );
      if (teamIds.length) {
        await tx
          .update(TeamMember)
          .set(stamp)
          .where(
            and(
              inArray(TeamMember.teamId, teamIds),
              isNull(TeamMember.deletedDate),
            ),
          );
      }
      await tx
        .update(Team)
        .set(stamp)
        .where(and(eq(Team.companyId, companyId), isNull(Team.deletedDate)));
      await tx
        .update(CompanyRole)
        .set(stamp)
        .where(
          and(
            eq(CompanyRole.companyId, companyId),
            isNull(CompanyRole.deletedDate),
          ),
        );
      await tx
        .update(CompanySubscription)
        .set(stamp)
        .where(
          and(
            eq(CompanySubscription.companyId, companyId),
            isNull(CompanySubscription.deletedDate),
          ),
        );
    }

    // 6. Notifications addressed to the user or scoped to the personal company.
    await tx
      .update(Notification)
      .set(stamp)
      .where(
        and(
          companyId
            ? or(
                eq(Notification.userId, userId),
                eq(Notification.companyId, companyId),
              )
            : eq(Notification.userId, userId),
          isNull(Notification.deletedDate),
        ),
      );

    // 7. Every company membership (incl. shared companies the user belonged to)
    // and its role assignments.
    const membershipRows = await tx
      .select({ id: UserCompany.id })
      .from(UserCompany)
      .where(
        and(eq(UserCompany.userId, userId), isNull(UserCompany.deletedDate)),
      );
    const membershipIds = membershipRows.map((r) => r.id);

    if (membershipIds.length) {
      await tx
        .update(UserCompanyRole)
        .set(stamp)
        .where(
          and(
            inArray(UserCompanyRole.userCompanyId, membershipIds),
            isNull(UserCompanyRole.deletedDate),
          ),
        );
    }
    await tx
      .update(UserCompany)
      .set(stamp)
      .where(
        and(eq(UserCompany.userId, userId), isNull(UserCompany.deletedDate)),
      );

    return { user, deletedAt: now };
  });
};
