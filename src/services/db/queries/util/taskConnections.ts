import { and, eq, inArray, isNull, or } from "drizzle-orm";

import {
  db,
  Task,
  TaskSequence,
  TaskRelationship,
} from "../../index.js";
import { taskSequenceType, taskRelationshipType } from "../../constants.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * A submitted task-sequence link, relative to the task being edited.
 * `direction: "predecessor"` → the referenced task must precede this one;
 * `direction: "successor"` → this task must precede the referenced one.
 */
export type SequenceInput = {
  taskId: string;
  direction: "predecessor" | "successor";
  type?: (typeof taskSequenceType)[number];
  lagOffset?: number;
};

/**
 * A submitted task-relationship link, relative to the task being edited.
 * `direction: "from"` → this task is the `fromId`; `direction: "to"` → this task
 * is the `toId`.
 */
export type RelationshipInput = {
  taskId: string;
  direction: "from" | "to";
  type?: (typeof taskRelationshipType)[number];
};

/**
 * Re-parent a phase's child tasks (Task.parentTaskId). `undefined` → no-op; a
 * provided array is the desired set of `type='task'` children within the project.
 * Children dropped from the set have their parent cleared.
 */
export const reconcileChildTasksForPhase = async (
  tx: Tx,
  {
    phaseId,
    projectId,
    taskIds,
  }: {
    phaseId: string;
    projectId: string;
    taskIds?: string[];
  },
) => {
  if (taskIds === undefined) return;

  const desired = new Set(taskIds);

  const rows = await tx
    .select({ id: Task.id })
    .from(Task)
    .where(
      and(
        eq(Task.parentTaskId, phaseId),
        eq(Task.projectId, projectId),
        eq(Task.type, "task"),
        isNull(Task.deletedDate),
      ),
    );
  const current = new Set(rows.map((r) => r.id));

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  // Attach desired children — only plain tasks in the same project.
  if (toAdd.length)
    await tx
      .update(Task)
      .set({ parentTaskId: phaseId })
      .where(
        and(
          inArray(Task.id, toAdd),
          eq(Task.projectId, projectId),
          eq(Task.type, "task"),
          isNull(Task.deletedDate),
        ),
      );

  // Detach children no longer in the set.
  if (toRemove.length)
    await tx
      .update(Task)
      .set({ parentTaskId: null })
      .where(
        and(
          inArray(Task.id, toRemove),
          eq(Task.parentTaskId, phaseId),
        ),
      );
};

/**
 * Full-replace a task's sequence links (TaskSequence) — every row where the task
 * is predecessor or successor is deleted and re-inserted from the desired set.
 * `undefined` → no-op.
 */
export const reconcileTaskSequences = async (
  tx: Tx,
  { taskId, sequences }: { taskId: string; sequences?: SequenceInput[] },
) => {
  if (sequences === undefined) return;

  await tx
    .delete(TaskSequence)
    .where(
      or(
        eq(TaskSequence.predecessorId, taskId),
        eq(TaskSequence.successorId, taskId),
      ),
    );

  if (!sequences.length) return;

  await tx.insert(TaskSequence).values(
    sequences.map((seq) => ({
      predecessorId: seq.direction === "predecessor" ? seq.taskId : taskId,
      successorId: seq.direction === "predecessor" ? taskId : seq.taskId,
      type: seq.type,
      lagOffset: seq.lagOffset,
    })),
  );
};

/**
 * Full-replace a task's relationship links (TaskRelationship) — every row where
 * the task is `fromId` or `toId` is deleted and re-inserted from the desired set.
 * `undefined` → no-op.
 */
export const reconcileTaskRelationships = async (
  tx: Tx,
  {
    taskId,
    relationships,
  }: { taskId: string; relationships?: RelationshipInput[] },
) => {
  if (relationships === undefined) return;

  await tx
    .delete(TaskRelationship)
    .where(
      or(
        eq(TaskRelationship.fromId, taskId),
        eq(TaskRelationship.toId, taskId),
      ),
    );

  if (!relationships.length) return;

  await tx.insert(TaskRelationship).values(
    relationships.map((rel) => ({
      fromId: rel.direction === "from" ? taskId : rel.taskId,
      toId: rel.direction === "from" ? rel.taskId : taskId,
      type: rel.type,
    })),
  );
};
