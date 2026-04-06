import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken";
import { getProjectTask } from "../../../../../actions/projects";
import { HTTP_STATUSES } from "../../../../../actions";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { projectId, taskId },
      user,
    } = req;

    const { status, message, task } = await getProjectTask({
      userId: user.id,
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
});

export default router;
