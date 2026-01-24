import { Project } from "../../../services/database";
import Task from "../../../services/database/schemas/Task";
import {
  ProjectDocument,
  TaskDocument,
} from "../../../services/database/types";

type ListPersonalProjectTasksArgs = {
  userId: string;
  page: number;
  projectId: string;
};

const PAGE_SIZE = 15;

export const listPersonalProjectTasks = async ({
  userId,
  page,
  projectId,
}: ListPersonalProjectTasksArgs) => {
  const [
    {
      tasks,
      info: [{ total } = { total: 0 }],
    },
  ] = await Task.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $match: {
        "owner.id": userId.toString(),
        deletedAt: { $exists: false },
      },
    },
    {
      $facet: {
        tasks: [
          { $skip: (Number(page) - 1) * PAGE_SIZE },
          { $limit: PAGE_SIZE },
        ],
        info: [{ $count: "total" }],
      },
    },
  ]);

  return {
    status: 200,
    message: "Tasks fetched",
    tasks: tasks?.map(
      ({
        name,
        description,
        _id,
        status,
        startDate,
        dueDate,
        priority,
      }: TaskDocument) => ({
        name,
        description,
        _id,
        status,
        startDate,
        dueDate,
        priority,
      })
    ),
    totalItems: total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};
