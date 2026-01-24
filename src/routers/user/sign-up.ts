import { Router } from "express";

import { HTTP_STATUSES, signUp } from "../../actions";

const router = Router({ mergeParams: true });

router.route("/").post(async (req: any, res) => {
  try {
    const {
      body: { email, password, name },
    } = req;

    const { status, message, user } = await signUp({
      email,
      name,
      password,
      referer: req.headers.referer?.split("?")[0] as string,
    });

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
