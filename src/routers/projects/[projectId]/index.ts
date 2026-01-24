import { Router } from "express";
import verifyToken from "../../../services/auth/verifyToken";
import {
  editPersonalProject,
  getPersonalProject,
} from "../../../actions/user/project";
import { HTTP_STATUSES } from "../../../actions";
import taskRouter from "./task";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { projectId },
        user,
      } = req;

      const { status, message, project } = await getPersonalProject({
        userId: user._id,
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

      const { status, message, project } = await editPersonalProject({
        userId: user._id,
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

router.use("/task", taskRouter);

export default router;
