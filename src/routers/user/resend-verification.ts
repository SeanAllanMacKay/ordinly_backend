import { Router } from "express";

import { HTTP_STATUSES, resendVerification } from "../../actions/index.js";
import verifyToken from "../../services/auth/verifyToken.js";

const router = Router({ mergeParams: true });

router.route("/").post(verifyToken, async (req: any, res) => {
  try {
    const {
      user: { email },
    } = req;

    const { status, message } = await resendVerification({
      email,
      referer: req.headers.referer?.split("?")[0] as string,
    });

    res.status(status).send({ message });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error resending your verification email",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
