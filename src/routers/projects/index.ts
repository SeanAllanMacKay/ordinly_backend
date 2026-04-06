import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken";
import {
  listProjects,
  createProject,
  listProjectPriorities,
  listProjectStatuses,
} from "../../actions";
import { HTTP_STATUSES } from "../../actions";
import projectIdRouter from "./[projectId]";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { page },
      user,
    } = req;

    const { status, message, projects, totalItems, totalPages } =
      await listProjects({
        userId: user.id,
        page: Number(page),
      });

    res
      .status(status)
      .send({ message, projects, totalItems, totalPages, page: Number(page) });
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
    const { body, user } = req;

    const { status, message, project } = await createProject({
      ...body,
      userId: user.id,
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
