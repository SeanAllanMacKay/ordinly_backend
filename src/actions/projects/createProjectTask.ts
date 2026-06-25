import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { randomUUID as uuid } from "crypto";
import {
  InsertProjectTaskProps,
  isProjectInCompany,
  insertProjectTask,
} from "../../services/db/index.js";
import * as z from "zod";
import { assertCompanyPermission } from "../permissions/index.js";
import {
  validateCompanyMembers,
  validateCompanyTeams,
  validateProjectTaskLinks,
} from "../util/validateConnections.js";
import { taskLinkFields } from "./taskLinkSchemas.js";
import { fileService } from "../../services/files/index.js";

const CreateProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  companyId: z.string("Invalid companyId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  checklist: z.array(z.string()).optional(),
  // Link a task to its parent phase.
  phaseId: z.string("Invalid phaseId").nullable().optional(),
  ...taskLinkFields,
  documents: z
    .array(
      z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z.number(),
        buffer: z.custom<Buffer>((data) => data instanceof Buffer, {
          message: "Buffer is required",
        }),
      }),
    )
    .optional(),
}).meta({ id: "POST /api/company/{companyId}/projects/{projectId}/tasks", route: "POST /api/company/{companyId}/projects/{projectId}/tasks" });

export const createProjectTask = async (
  createTaskProps: InsertProjectTaskProps & {
    companyId: string;
    phaseId?: string | null;
    documents: Express.Multer.File[];
  },
) => {
  try {
    CreateProjectTaskSchema.parse(createTaskProps);

    // phaseId maps to Task.parentTaskId; raw multer files are re-uploaded below.
    const { phaseId, documents: _rawDocuments, ...taskProps } = createTaskProps;
    const { userId, companyId, projectId } = taskProps;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_tasks",
      action: "create",
    });

    if (createTaskProps.documents?.length) {
      await assertCompanyPermission({
        userId,
        companyId,
        key: "task_documents",
        action: "create",
      });
    }

    if (!(await isProjectInCompany({ projectId, companyId }))) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Project not found"],
      };
    }

    // Links must belong to the company / project.
    await validateCompanyMembers({ companyId, userIds: createTaskProps.userIds });
    await validateCompanyTeams({ companyId, teamIds: createTaskProps.teamIds });
    await validateProjectTaskLinks({
      projectId,
      phaseId,
      sequences: createTaskProps.sequences,
      relationships: createTaskProps.relationships,
    });

    const taskId = uuid();

    let documents = undefined;

    if (createTaskProps.documents?.length) {
      documents = await fileService.uploadTaskDocuments({
        files: createTaskProps.documents,
        taskId,
      });
    }

    const newTask = await insertProjectTask({
      ...taskProps,
      type: "task",
      parentTaskId: phaseId ?? undefined,
      documents,
      taskId,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Task created",
      task: newTask,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error creating this task"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
