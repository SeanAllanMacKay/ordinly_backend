import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken.js";
import {
  updateReminder,
  cancelReminder,
  HTTP_STATUSES,
} from "../../../../../actions/index.js";

const router = Router({ mergeParams: true });

// PATCH  /api/company/:companyId/reminders/:reminderId — edit / reschedule
// DELETE /api/company/:companyId/reminders/:reminderId — cancel
router
  .route("/")
  .patch(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, reminderId },
        user,
      } = req;

      const { status, message, reminder } = await updateReminder({
        ...body,
        userId: user.id,
        companyId,
        reminderId,
      });

      res.status(status).send({ message, reminder });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the reminder",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, reminderId },
        user,
      } = req;

      const { status, message, reminder } = await cancelReminder({
        userId: user.id,
        companyId,
        reminderId,
      });

      res.status(status).send({ message, reminder });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error cancelling the reminder",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
