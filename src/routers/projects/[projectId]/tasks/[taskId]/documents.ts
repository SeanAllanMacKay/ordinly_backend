import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken.js";
import { HTTP_STATUSES } from "../../../../../actions/index.js";
import { getProjectTaskDocument } from "../../../../../actions/projects/getProjectTaskDocument.js";

const router = Router({ mergeParams: true });

router
  .route("/:documentId/download-url")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { projectId, taskId, documentId },
        user,
      } = req;

      const {
        status,
        message,
        document: { downloadURL },
      } = await getProjectTaskDocument({
        userId: user.id,
        projectId,
        taskId,
        documentId,
      });

      res.status(status).send({ message, downloadURL });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching this task",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
