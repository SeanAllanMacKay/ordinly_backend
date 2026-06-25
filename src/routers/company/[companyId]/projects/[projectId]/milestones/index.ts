import { Router } from "express";
import verifyToken from "../../../../../../services/auth/verifyToken.js";
import {
  listMilestoneOptions,
  listMilestones,
  createMilestone,
} from "../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../actions/index.js";
import milestoneRouter from "./[milestoneId]/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/projects/:projectId/milestones/options — slim { value, label } list
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId, projectId },
      user,
    } = req;

    const { status, message, options } = await listMilestoneOptions({
      userId: user.id,
      companyId,
      projectId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the milestone options",
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

      const { status, message, milestones, totalItems, totalPages } =
        await listMilestones({ userId: user.id, companyId, projectId });

      res
        .status(status)
        .send({ message, milestones, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching these milestones",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        user,
        params: { companyId, projectId },
      } = req;

      const { status, message, milestone } = await createMilestone({
        ...body,
        userId: user.id,
        companyId,
        projectId,
      });

      res.status(status).send({ message, milestone });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error creating this milestone",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/:milestoneId", milestoneRouter);

export default router;
