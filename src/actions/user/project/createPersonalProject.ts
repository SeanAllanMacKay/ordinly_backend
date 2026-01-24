import { Project } from "../../../services/database";
import { HTTP_STATUSES } from "../../HTTP_STATUSES";

export type CreateProjectProps = {
  userId: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  dueDate?: Date;
};

export const createPersonalProject = async ({
  userId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: CreateProjectProps) => {
  const now = new Date();

  const projetInfo = {
    name,
    description,
    status,
    priority,
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    owner: { variant: "user", id: userId },
    createdBy: userId,
    createdAt: now,
  };

  const newProject = await Project.create(projetInfo);

  if (!newProject) {
    throw {
      status: HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error: "There was an error creating this project",
    };
  }

  await newProject.save();

  return {
    status: HTTP_STATUSES.SUCCESS.CREATED,
    message: "Project successfully created",
    project: {
      _id: newProject?._id,
      ...projetInfo,
    },
  };
};
