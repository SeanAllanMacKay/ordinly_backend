import { Router } from "express";
import verifyToken from "../../../services/auth/verifyToken";
import { updateProject, getProject } from "../../../actions/projects";
import { HTTP_STATUSES } from "../../../actions";
import tasksRouter from "./tasks";

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
