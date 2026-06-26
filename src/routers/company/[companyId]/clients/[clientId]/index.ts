import { Router } from "express";
import verifyToken from "../../../../../services/auth/verifyToken.js";
import { singleFileHandler } from "../../../../../services/files/index.js";
import {
  getClient,
  updateClient,
  deleteClient,
  updateClientProfilePicture,
  removeClientProfilePicture,
  HTTP_STATUSES,
} from "../../../../../actions/index.js";
import contactsRouter from "./contacts/index.js";

const router = Router({ mergeParams: true });

// GET / PUT / DELETE /api/company/:companyId/clients/:clientId
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId },
        user,
      } = req;

      const { status, message, client } = await getClient({
        userId: user.id,
        companyId,
        clientId,
      });

      res.status(status).send({ message, client });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the client",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, clientId },
        user,
      } = req;

      const { status, message, client } = await updateClient({
        ...body,
        userId: user.id,
        companyId,
        clientId,
      });

      res.status(status).send({ message, client });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the client",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId },
        user,
      } = req;

      const { status, message } = await deleteClient({
        userId: user.id,
        companyId,
        clientId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting the client",
      } = caught;

      res.status(status).send({ error });
    }
  });

// PUT / DELETE /api/company/:companyId/clients/:clientId/profile-picture
router
  .route("/profile-picture")
  .put(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const {
          params: { companyId, clientId },
          user,
        } = req;

        const { status, message, client } = await updateClientProfilePicture({
          userId: user.id,
          companyId,
          clientId,
          file: req.profilePicture,
        });

        res.status(status).send({ message, client });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error updating the client profile picture",
        } = caught;

        res.status(status).send({ error });
      }
    },
  )
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId },
        user,
      } = req;

      const { status, message, client } = await removeClientProfilePicture({
        userId: user.id,
        companyId,
        clientId,
      });

      res.status(status).send({ message, client });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error removing the client profile picture",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/contacts", contactsRouter);

export default router;
