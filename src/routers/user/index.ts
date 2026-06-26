import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import { singleFileHandler } from "../../services/files/index.js";
import signUpRouter from "./sign-up.js";
import verifyAccountRouter from "./verify-account.js";
import resendVerificationRouter from "./resend-verification.js";
import loginRouter from "./login.js";
import logoutRouter from "./logout.js";
import {
  HTTP_STATUSES,
  deleteAccount,
  updateUser,
  updateProfilePicture,
  removeProfilePicture,
} from "../../actions/index.js";

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
  .patch(verifyToken, async (req: any, res) => {
    try {
      const {
        body: { preferredLanguage },
        user,
      } = req;

      const {
        status,
        message,
        user: updated,
      } = await updateUser({ userId: user.id, preferredLanguage });

      res.status(status).send({ message, user: updated });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating your profile",
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

router
  .route("/profile-picture")
  .put(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const { status, message, user } = await updateProfilePicture({
          userId: req.user.id,
          file: req.profilePicture,
        });

        res.status(status).send({ message, user });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error updating your profile picture",
        } = caught;

        res.status(status).send({ error });
      }
    },
  )
  .delete(verifyToken, async (req: any, res) => {
    try {
      const { status, message, user } = await removeProfilePicture({
        userId: req.user.id,
      });

      res.status(status).send({ message, user });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error removing your profile picture",
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
