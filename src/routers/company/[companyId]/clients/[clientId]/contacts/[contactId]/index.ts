import { Router } from "express";
import verifyToken from "../../../../../../../services/auth/verifyToken.js";
import { singleFileHandler } from "../../../../../../../services/files/index.js";
import {
  getContact,
  updateContact,
  deleteContact,
  updateContactProfilePicture,
  removeContactProfilePicture,
  HTTP_STATUSES,
} from "../../../../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET / PUT / DELETE
// /api/company/:companyId/clients/:clientId/contacts/:contactId
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId, contactId },
        user,
      } = req;

      const { status, message, contact } = await getContact({
        userId: user.id,
        companyId,
        clientId,
        contactId,
      });

      res.status(status).send({ message, contact });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the contact",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, clientId, contactId },
        user,
      } = req;

      const { status, message, contact } = await updateContact({
        ...body,
        userId: user.id,
        companyId,
        clientId,
        contactId,
      });

      res.status(status).send({ message, contact });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the contact",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId, contactId },
        user,
      } = req;

      const { status, message } = await deleteContact({
        userId: user.id,
        companyId,
        clientId,
        contactId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting the contact",
      } = caught;

      res.status(status).send({ error });
    }
  });

// PUT / DELETE
// /api/company/:companyId/clients/:clientId/contacts/:contactId/profile-picture
router
  .route("/profile-picture")
  .put(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const {
          params: { companyId, clientId, contactId },
          user,
        } = req;

        const { status, message, contact } = await updateContactProfilePicture({
          userId: user.id,
          companyId,
          clientId,
          contactId,
          file: req.profilePicture,
        });

        res.status(status).send({ message, contact });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error updating the contact profile picture",
        } = caught;

        res.status(status).send({ error });
      }
    },
  )
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId, contactId },
        user,
      } = req;

      const { status, message, contact } = await removeContactProfilePicture({
        userId: user.id,
        companyId,
        clientId,
        contactId,
      });

      res.status(status).send({ message, contact });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error removing the contact profile picture",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
