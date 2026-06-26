import { Router } from "express";

import { HTTP_STATUSES, signUp } from "../../actions/index.js";
import { AUTH_COOKIE_OPTIONS } from "../../services/auth/index.js";

const router = Router({ mergeParams: true });

router.route("/").post(async (req: any, res) => {
  try {
    const {
      body: { email, password, name, preferredLanguage },
    } = req;

    const { status, message, user, newToken } = await signUp({
      email,
      name,
      password,
      preferredLanguage,
      referer: req.headers.referer?.split("?")[0] as string,
    });

    if (newToken) {
      res.cookie("auth", newToken, AUTH_COOKIE_OPTIONS);
    }

    res.status(status).send({ message, ...(user ? { user } : {}) });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating this account",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
