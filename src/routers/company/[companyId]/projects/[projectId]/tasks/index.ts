import { Router } from "express";
import verifyToken from "../../../../../../services/auth/verifyToken.js";
import {
  createProjectTask,
  listProjectTasks,
  listTaskOptions,
} from "../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../actions/index.js";
import taskRouter from "./[taskId]/index.js";
import { multiFileHandler } from "../../../../../../services/files/fileMiddleware.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/projects/:projectId/tasks/options — slim { value, label } list
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId, projectId },
      user,
    } = req;

    const { status, message, options } = await listTaskOptions({
      userId: user.id,
      companyId,
      projectId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the task options",
    } = caught;

    res.status(status).send({ error });
  }
});

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId },
        user,
      } = req;

      const { status, message, tasks, totalItems, totalPages } =
        await listProjectTasks({
          userId: user.id,
          companyId,
          projectId,
        });

      res.status(status).send({ message, tasks, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching these tasks",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(
    verifyToken,
    multiFileHandler({ fieldName: "documents", uploadType: "document" }),
    async (req: any, res) => {
      try {
        const {
          body,
          user,
          params: { companyId, projectId },
          documents,
        } = req;

        const { status, message, task } = await createProjectTask({
          ...body,
          userId: user.id,
          companyId,
          projectId,
          documents,
        });

        res.status(status).send({ message, task });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error creating this task",
        } = caught;

        res.status(status).send({ error });
      }
    },
  );

router.use("/:taskId", taskRouter);

export default router;
