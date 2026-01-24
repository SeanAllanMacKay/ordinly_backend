import { Project } from "../../services/database";
import { ProjectDocument } from "../../services/database/types";
import { DEFAULT_PAGE_SIZE } from "../../services/database/constants";
import { HTTP_STATUSES } from "../HTTP_STATUSES";

type ListProjectsArgs = {
  userId: string;
  companyId?: string;
  page: number;
};

export const listProjects = async ({ userId, page }: ListProjectsArgs) => {
  const [
    {
      projects,
      info: [{ total } = { total: 0 }],
    },
  ] = await Project.aggregate([
    { $sort: { updatedAt: -1 } },
    {
      $match: {
        $or: [{ "owner.id": userId.toString() }],
        deletedAt: { $exists: false },
      },
    },
    {
      $facet: {
        projects: [
          { $skip: (Number(page) - 1) * DEFAULT_PAGE_SIZE },
          { $limit: DEFAULT_PAGE_SIZE },
        ],
        info: [{ $count: "total" }],
      },
    },
  ]);

  return {
    status: HTTP_STATUSES.SUCCESS.OK,
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
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
};
