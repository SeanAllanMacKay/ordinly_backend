import * as z from "zod";
import {
  taskSequenceType,
  taskRelationshipType,
} from "../../services/db/constants.js";

// A task-sequence link relative to the task being edited.
export const SequenceSchema = z.object({
  taskId: z.string("Invalid taskId"),
  direction: z.enum(["predecessor", "successor"]),
  type: z.enum(taskSequenceType).optional(),
  lagOffset: z.number().optional(),
});

// A task-relationship link relative to the task being edited.
export const RelationshipSchema = z.object({
  taskId: z.string("Invalid taskId"),
  direction: z.enum(["from", "to"]),
  type: z.enum(taskRelationshipType).optional(),
});

// Connection fields shared by task, phase, and milestone create/update schemas:
// assignees, teams, and the two flavours of task-to-task links.
export const taskLinkFields = {
  userIds: z.array(z.string("Invalid userId")).optional(),
  teamIds: z.array(z.string("Invalid teamId")).optional(),
  sequences: z.array(SequenceSchema).optional(),
  relationships: z.array(RelationshipSchema).optional(),
};
