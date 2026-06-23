import { Router } from "express";

import { HTTP_STATUSES } from "../../actions/index.js";
import { AUTH_COOKIE_OPTIONS } from "../../services/auth/index.js";

const router = Router({ mergeParams: true });

router.route("/").post(async (_req: any, res) => {
  try {
    res.clearCookie("auth", AUTH_COOKIE_OPTIONS);

    res
      .status(HTTP_STATUSES.SUCCESS.OK)
      .send({ message: "Logged out successfully" });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "We weren't able to log you out",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
