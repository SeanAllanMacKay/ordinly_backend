import { Router } from "express";
import verifyToken from "../../../../../../../services/auth/verifyToken.js";
import {
  getMilestone,
  updateMilestone,
  deleteMilestone,
} from "../../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../../actions/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, milestoneId },
        user,
      } = req;

      const { status, message, milestone } = await getMilestone({
        userId: user.id,
        companyId,
        projectId,
        milestoneId,
      });

      res.status(status).send({ message, milestone });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching this milestone",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, milestoneId },
        user,
        body,
      } = req;

      const { status, message, milestone } = await updateMilestone({
        ...body,
        userId: user.id,
        companyId,
        projectId,
        milestoneId,
      });

      res.status(status).send({ message, milestone });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error editing this milestone",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, projectId, milestoneId },
        user,
      } = req;

      const { status, message, milestone } = await deleteMilestone({
        userId: user.id,
        companyId,
        projectId,
        milestoneId,
      });

      res.status(status).send({ message, milestone });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting this milestone",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
