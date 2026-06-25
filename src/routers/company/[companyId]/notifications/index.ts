import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listNotifications,
  HTTP_STATUSES,
} from "../../../../actions/index.js";
import notificationRouter from "./[notificationId]/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/notifications — the user's in-app feed
// ?unreadOnly=true for the badge count
router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId },
      query: { unreadOnly },
      user,
    } = req;

    const { status, message, notifications } = await listNotifications({
      userId: user.id,
      companyId,
      unreadOnly,
    });

    res.status(status).send({ message, notifications });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching notifications",
    } = caught;

    res.status(status).send({ error });
  }
});

router.use("/:notificationId", notificationRouter);

export default router;
