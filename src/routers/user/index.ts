import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import signUpRouter from "./sign-up.js";
import verifyAccountRouter from "./verify-account.js";
import loginRouter from "./login.js";
import { HTTP_STATUSES } from "../../actions/index.js";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    if ("user" in req) {
      res
        .status(HTTP_STATUSES.SUCCESS.OK)
        .send({ message: "Account found", user: req.user });
    } else {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: "Account not found",
      };
    }
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching this user",
    } = caught;

    res.status(status).send({ error });
  }
});

router.use("/sign-up", signUpRouter);
router.use("/verify-account", verifyAccountRouter);
router.use("/login", loginRouter);

export default router;
