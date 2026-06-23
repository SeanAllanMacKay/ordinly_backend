import { Router } from "express";
import verifyToken from "../../../../../../../services/auth/verifyToken.js";
import { updateProjectTaskChecklist } from "../../../../../../../actions/projects/index.js";
import { HTTP_STATUSES } from "../../../../../../../actions/index.js";

const router = Router({ mergeParams: true });

router.route("/").put(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId, projectId, taskId },
      user,
      body,
    } = req;

    const { status, message, task } = await updateProjectTaskChecklist({
      userId: user.id,
      companyId,
      projectId,
      taskId,
      ...body,
    });

    res.status(status).send({ message, task });
  } catch (caught: any) {
    console.log(caught);
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error editing this task",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
