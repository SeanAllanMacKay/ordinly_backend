import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listClients,
  createClient,
  HTTP_STATUSES,
} from "../../../../actions/index.js";
import clientRouter from "./[clientId]/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/clients — list clients
// POST /api/company/:companyId/clients — create a client
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        query: { page, pageSize },
        params: { companyId },
        user,
      } = req;

      const { status, message, clients, totalItems, totalPages } =
        await listClients({ userId: user.id, companyId, page, pageSize });

      res.status(status).send({ message, clients, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the clients",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId },
        user,
      } = req;

      const { status, message, client } = await createClient({
        ...body,
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, client });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error creating the client",
      } = caught;

      res.status(status).send({ error });
    }
  });

router.use("/:clientId", clientRouter);

export default router;
