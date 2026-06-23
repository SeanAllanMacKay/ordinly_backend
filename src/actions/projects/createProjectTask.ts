import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { randomUUID as uuid } from "crypto";
import { InsertTaskProps } from "../../services/db/index.js";
import * as z from "zod";
import { insertProjectTask } from "../../services/db/index.js";
import { fileService } from "../../services/files/index.js";
import { taskType } from "../../services/db/constants.js";

const CreateProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  type: z.enum(taskType),
  companyId: z.string("Invalid companyId").optional(),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  checklist: z.array(z.string()).optional(),
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
});

export const createProjectTask = async (
  createTaskProps: InsertTaskProps & { documents: Express.Multer.File[] },
) => {
  try {
    CreateProjectTaskSchema.parse(createTaskProps);

    const taskId = uuid();

    let documents = undefined;

    if (createTaskProps.documents?.length) {
      documents = await fileService.uploadTaskDocuments({
        files: createTaskProps.documents,
        taskId,
      });
    }

    const newTask = await insertProjectTask({
      ...createTaskProps,
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
