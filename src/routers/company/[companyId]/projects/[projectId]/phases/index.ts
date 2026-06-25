import { Router } from "express";
import verifyToken from "../../../../../../services/auth/verifyToken.js";
import {
  listPhaseOptions,
  listPhases,
  createPhase,
} from "../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../actions/index.js";
import { multiFileHandler } from "../../../../../../services/files/fileMiddleware.js";
import phaseRouter from "./[phaseId]/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/projects/:projectId/phases/options — slim { value, label } list
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId, projectId },
      user,
    } = req;

    const { status, message, options } = await listPhaseOptions({
      userId: user.id,
      companyId,
      projectId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the phase options",
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

      const { status, message, phases, totalItems, totalPages } =
        await listPhases({ userId: user.id, companyId, projectId });

      res.status(status).send({ message, phases, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching these phases",
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

        const { status, message, phase } = await createPhase({
          ...body,
          userId: user.id,
          companyId,
          projectId,
          documents,
        });

        res.status(status).send({ message, phase });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error creating this phase",
        } = caught;

        res.status(status).send({ error });
      }
    },
  );

router.use("/:phaseId", phaseRouter);

export default router;
