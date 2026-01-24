import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken";
import { listPersonalProjectTasks } from "../../../../actions/user/project";
import { HTTP_STATUSES } from "../../../../actions";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { projectId },
      query: { page },
      user,
    } = req;

    const { status, message, tasks, totalItems, totalPages } =
      await listPersonalProjectTasks({
        userId: user._id,
        projectId,
        page,
      });

    res.status(status).send({ message, tasks, totalItems, totalPages });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching this project's tasks",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
