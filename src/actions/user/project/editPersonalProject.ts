import { Project } from "../../../services/database";
import { HTTP_STATUSES } from "../../HTTP_STATUSES";

export type EditProjectProps = {
  userId: string;
  projectId: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  dueDate?: Date;
};

export const editPersonalProject = async ({
  userId,
  projectId,
  name,
  description,
  status,
  priority,
  startDate,
  dueDate,
}: EditProjectProps) => {
  const projetInfo = {
    name,
    description,
    status,
    priority,
    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  };

  const project = await Project.findOneAndUpdate(
    { $and: [{ "owner.id": userId.toString() }, { _id: projectId }] },
    projetInfo
  );

  if (!project) {
    throw {
      status: HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error: "There was an error editing this project",
    };
  }

  await project.save();

  return {
    status: HTTP_STATUSES.SUCCESS.CREATED,
    message: "Project successfully editied",
    project: {
      _id: project?._id,
      ...projetInfo,
    },
  };
};
