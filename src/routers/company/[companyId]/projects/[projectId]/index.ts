import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken.js";
import {
  updateProject,
  getProject,
  deleteProject,
} from "../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../actions/index.js";
import tasksRouter from "./tasks/index.js";
import phasesRouter from "./phases/index.js";
import milestonesRouter from "./milestones/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId },
        user,
      } = req;

      const { status, message, project } = await getProject({
        userId: user.id,
        companyId,
        projectId,
      });

      res.status(status).send({ message, project });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching this project",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId },
        user,
        body,
      } = req;

      const { status, message, project } = await updateProject({
        userId: user.id,
        companyId,
        projectId,
        ...body,
      });

      res.status(status).send({ message, project });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error editing this project",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId },
        user,
      } = req;

      const { status, message, project } = await deleteProject({
        userId: user.id,
        companyId,
        projectId,
      });

      res.status(status).send({ message, project });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting this project",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/tasks", tasksRouter);
router.use("/phases", phasesRouter);
router.use("/milestones", milestonesRouter);

export default router;
