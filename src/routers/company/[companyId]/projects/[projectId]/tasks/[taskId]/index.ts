import { Router } from "express";
import verifyToken from "../../../../../../../services/auth/verifyToken.js";
import {
  getProjectTask,
  updateProjectTask,
} from "../../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../../actions/index.js";
import checklistRouter from "./checklist.js";
import documentsRouter from "./documents.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, taskId },
        user,
      } = req;

      const { status, message, task } = await getProjectTask({
        userId: user.id,
        companyId,
        projectId,
        taskId,
      });

      res.status(status).send({ message, task });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching this task",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, taskId },
        user,
        body,
      } = req;

      const { status, message, task } = await updateProjectTask({
        userId: user.id,
        companyId,
        projectId,
        taskId,
        ...body,
      });

      res.status(status).send({ message, task });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error editing this task",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/checklist", checklistRouter);
router.use("/documents", documentsRouter);

export default router;
