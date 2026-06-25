import { Router } from "express";
import verifyToken from "../../../../../../../services/auth/verifyToken.js";
import {
  getPhase,
  updatePhase,
  deletePhase,
} from "../../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../../actions/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, phaseId },
        user,
      } = req;

      const { status, message, phase } = await getPhase({
        userId: user.id,
        companyId,
        projectId,
        phaseId,
      });

      res.status(status).send({ message, phase });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching this phase",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, phaseId },
        user,
        body,
      } = req;

      const { status, message, phase } = await updatePhase({
        ...body,
        userId: user.id,
        companyId,
        projectId,
        phaseId,
      });

      res.status(status).send({ message, phase });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error editing this phase",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, phaseId },
        user,
      } = req;

      const { status, message, phase } = await deletePhase({
        userId: user.id,
        companyId,
        projectId,
        phaseId,
      });

      res.status(status).send({ message, phase });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting this phase",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
