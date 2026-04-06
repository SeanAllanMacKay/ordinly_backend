import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken";
import {
  createProjectTask,
  listProjectTasks,
} from "../../../../actions/projects";
import { HTTP_STATUSES } from "../../../../actions";
import taskRouter from "./[taskId]";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { projectId },
        user,
      } = req;

      console.log();

      const { status, message, tasks } = await listProjectTasks({
        userId: user.id,
        projectId,
      });

      res.status(status).send({ message, tasks });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching these tasks",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        user,
        params: { projectId },
      } = req;

      const { status, message, task } = await createProjectTask({
        ...body,
        userId: user.id,
        projectId,
      });

      res.status(status).send({ message, task });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error creating this task",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/:taskId", taskRouter);

export default router;
