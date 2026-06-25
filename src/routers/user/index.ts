import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import signUpRouter from "./sign-up.js";
import verifyAccountRouter from "./verify-account.js";
import resendVerificationRouter from "./resend-verification.js";
import loginRouter from "./login.js";
import logoutRouter from "./logout.js";
import { HTTP_STATUSES, deleteAccount } from "../../actions/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
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
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        body: { password },
        headers: { referer },
        user,
      } = req;

      const { status, message } = await deleteAccount({
        userId: user.id,
        password,
        referer,
      });

      res.clearCookie("auth");
      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting your account",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/sign-up", signUpRouter);
router.use("/verify-account", verifyAccountRouter);
router.use("/resend-verification", resendVerificationRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);

export default router;
