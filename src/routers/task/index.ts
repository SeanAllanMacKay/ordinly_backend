import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import {
  listTaskPriorities,
  listTaskStatuses,
  HTTP_STATUSES,
} from "../../actions/index.js";

const router = Router({ mergeParams: true });

router.route("/priority").get(verifyToken, async (req: any, res) => {
  try {
    const { body, user } = req;

    const { status, message, taskPriorities } = await listTaskPriorities({
      ...body,
      userId: user.id,
    });

    res.status(status).send({ message, taskPriorities });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching these task priorities",
    } = caught;

    res.status(status).send({ error });
  }
});

router.route("/status").get(verifyToken, async (req: any, res) => {
  try {
    const { body, user } = req;

    const { status, message, taskStatuses } = await listTaskStatuses({
      ...body,
      userId: user.id,
    });

    res.status(status).send({ message, taskStatuses });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching these task statuses",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
