import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import { insertProject, InsertProjectProps } from "../../services/db/index.js";
import { assertCompanyPermission } from "../permissions/index.js";
import * as z from "zod";

const CreateProjectSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId").optional(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        isComplete: z.boolean(),
      }),
    )
    .optional(),
  location: z
    .object({
      name: z.string().optional(),
      type: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export const createProject = async (createProjectProps: InsertProjectProps) => {
  try {
    CreateProjectSchema.parse(createProjectProps);

    const { userId, companyId } = createProjectProps;

    if (!companyId) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: ["companyId is required"],
      };
    }

    await assertCompanyPermission({
      userId,
      companyId,
      key: "all_projects",
      action: "create",
    });

    const newProject = await insertProject(createProjectProps);

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Project created",
      project: newProject,
    };
  } catch (caught: any) {
    console.log(caught);
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error creating this project"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
