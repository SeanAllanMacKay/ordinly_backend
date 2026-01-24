import { Project } from "../../services/database";
import { HTTP_STATUSES } from "../HTTP_STATUSES";

export type CreateProjectProps = {
  userId: string;
  companyId?: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  dueDate?: Date;
};

export const createProject = async ({
  userId,
  companyId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: CreateProjectProps) => {
  const now = new Date();

  const projectInfo = {
    name,
    description,
    status,
    priority,
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    owner: companyId
      ? { variant: "company", id: companyId }
      : { variant: "user", id: userId },
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  const newProject = await Project.create(projectInfo);

  if (!newProject) {
    throw {
      status: HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error: "There was an error creating this project",
    };
  }

  return {
    status: HTTP_STATUSES.SUCCESS.CREATED,
    message: "Project created",
    project: {
      _id: newProject?._id,
      ...projectInfo,
    },
  };
};
