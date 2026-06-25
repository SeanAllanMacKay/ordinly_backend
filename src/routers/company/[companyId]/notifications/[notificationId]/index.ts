import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken.js";
import {
  markNotificationRead,
  HTTP_STATUSES,
} from "../../../../../actions/index.js";

const router = Router({ mergeParams: true });

// PATCH /api/company/:companyId/notifications/:notificationId/read
router.route("/read").patch(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId, notificationId },
      user,
    } = req;

    const { status, message, notification } = await markNotificationRead({
      userId: user.id,
      companyId,
      notificationId,
    });

    res.status(status).send({ message, notification });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error updating the notification",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
