import { Router } from "express";
import verifyToken from "../../../../../../services/auth/verifyToken.js";
import { singleFileHandler } from "../../../../../../services/files/index.js";
import {
  listContacts,
  listContactOptions,
  createContact,
  HTTP_STATUSES,
} from "../../../../../../actions/index.js";
import contactRouter from "./[contactId]/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/clients/:clientId/contacts/options — slim { value, label } list
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId, clientId },
      user,
    } = req;

    const { status, message, options } = await listContactOptions({
      userId: user.id,
      companyId,
      clientId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the contact options",
    } = caught;

    res.status(status).send({ error });
  }
});

// GET /api/company/:companyId/clients/:clientId/contacts — list contacts
// POST /api/company/:companyId/clients/:clientId/contacts — create a contact
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, clientId },
        user,
      } = req;

      const { status, message, contacts } = await listContacts({
        userId: user.id,
        companyId,
        clientId,
      });

      res.status(status).send({ message, contacts });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the contacts",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const {
          body,
          params: { companyId, clientId },
          user,
        } = req;

        const { status, message, contact } = await createContact({
          ...body,
          userId: user.id,
          companyId,
          clientId,
          profilePicture: req.profilePicture,
        });

        res.status(status).send({ message, contact });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error creating the contact",
        } = caught;

        res.status(status).send({ error });
      }
    },
  );

router.use("/:contactId", contactRouter);

export default router;
