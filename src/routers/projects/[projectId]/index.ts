import { Router } from "express";
import verifyToken from "../../../services/auth/verifyToken.js";
import { updateProject, getProject } from "../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../actions/index.js";
import tasksRouter from "./tasks/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { projectId },
        user,
      } = req;

      const { status, message, project } = await getProject({
        userId: user.id,
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
        params: { projectId },
        user,
        body,
      } = req;

      const { status, message, project } = await updateProject({
        userId: user.id,
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
  });

router.use("/tasks", tasksRouter);

export default router;
