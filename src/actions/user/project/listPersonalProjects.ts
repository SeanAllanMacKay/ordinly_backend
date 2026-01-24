import { Project } from "../../../services/database";
import { ProjectDocument } from "../../../services/database/types";

type ListPersonalProjectsArgs = {
  userId: string;
  page: number;
};

const PAGE_SIZE = 15;

export const listPersonalProjects = async ({
  userId,
  page,
}: ListPersonalProjectsArgs) => {
  const [
    {
      projects,
      info: [{ total } = { total: 0 }],
    },
  ] = await Project.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $match: {
        "owner.id": userId.toString(),
        deletedAt: { $exists: false },
      },
    },
    {
      $facet: {
        projects: [
          { $skip: (Number(page) - 1) * PAGE_SIZE },
          { $limit: PAGE_SIZE },
        ],
        info: [{ $count: "total" }],
      },
    },
  ]);

  return {
    status: 200,
    message: "Projects fetched",
    projects: projects?.map(
      ({
        name,
        description,
        _id,
        owner,
        status,
        startDate,
        dueDate,
        priority,
      }: ProjectDocument) => ({
        name,
        description,
        _id,
        owner,
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
