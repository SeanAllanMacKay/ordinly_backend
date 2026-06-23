import { Router } from "express";

import { HTTP_STATUSES, login } from "../../actions/index.js";
import { AUTH_COOKIE_OPTIONS } from "../../services/auth/index.js";

const router = Router({ mergeParams: true });

router.route("/").post(async (req: any, res) => {
  try {
    const {
      body: { password, email },
    } = req;

    const { status, user, newToken } = await login({ password, email });

    if (newToken) {
      res.cookie("auth", newToken, AUTH_COOKIE_OPTIONS);
    }

    res.status(status).send({ user });
  } catch (caught: any) {
    console.log(caught);
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "We weren't able to log you in",
    } = caught;

    res.clearCookie("auth");

    res.status(status).send({ error });
  }
});

export default router;
