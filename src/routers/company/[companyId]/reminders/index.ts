import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listReminders,
  createReminder,
  HTTP_STATUSES,
} from "../../../../actions/index.js";
import reminderRouter from "./[reminderId]/index.js";

const router = Router({ mergeParams: true });

// GET  /api/company/:companyId/reminders — list the user's reminders
// POST /api/company/:companyId/reminders — schedule a reminder
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId },
        user,
      } = req;

      const { status, message, reminders } = await listReminders({
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, reminders });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching reminders",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId },
        user,
      } = req;

      const { status, message, reminder } = await createReminder({
        ...body,
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, reminder });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error scheduling the reminder",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/:reminderId", reminderRouter);

export default router;
