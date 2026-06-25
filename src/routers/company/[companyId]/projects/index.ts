import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listProjects,
  listProjectOptions,
  createProject,
  listProjectPriorities,
  listProjectStatuses,
} from "../../../../actions/index.js";
import { HTTP_STATUSES } from "../../../../actions/index.js";
import projectIdRouter from "./[projectId]/index.js";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { page },
      params: { companyId },
      user,
    } = req;

    const { status, message, projects, totalItems, totalPages } =
      await listProjects({
        userId: user.id,
        companyId,
        page: Number(page),
      });

    console.log({ projects });

    res.status(status).send({
      message,
      projects,
      totalItems,
      totalPages,
      page: Number(page),
    });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching your projects",
    } = caught;

    res.status(status).send({ error });
  }
});

router.route("/").post(verifyToken, async (req: any, res) => {
  try {
    const {
      body,
      user,
      params: { companyId },
    } = req;

    const { status, message, project } = await createProject({
      ...body,
      userId: user.id,
      companyId,
    });

    res.status(status).send({ message, project });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating this project",
    } = caught;

    res.status(status).send({ error });
  }
});

// GET /api/company/:companyId/projects/options — slim { value, label } list for FE selects
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId },
      user,
    } = req;

    const { status, message, options } = await listProjectOptions({
      userId: user.id,
      companyId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the project options",
    } = caught;

    res.status(status).send({ error });
  }
});

router.route("/priority").get(verifyToken, async (req: any, res) => {
  try {
    const { body, user } = req;

    const { status, message, projectPriorities } = await listProjectPriorities({
      ...body,
      userId: user.id,
    });

    res.status(status).send({ message, projectPriorities });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating these project priorities",
    } = caught;

    res.status(status).send({ error });
  }
});

router.route("/status").get(verifyToken, async (req: any, res) => {
  try {
    const { body, user } = req;

    const { status, message, projectStatuses } = await listProjectStatuses({
      ...body,
      userId: user.id,
    });

    res.status(status).send({ message, projectStatuses });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating these project statuses",
    } = caught;

    res.status(status).send({ error });
  }
});

router.use("/:projectId", projectIdRouter);

export default router;
