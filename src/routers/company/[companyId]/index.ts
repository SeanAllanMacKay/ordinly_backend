import { Router } from "express";

import verifyToken from "../../../services/auth/verifyToken.js";
import { HTTP_STATUSES } from "../../../actions/index.js";
import { deleteCompany } from "../../../actions/company/deleteCompany.js";
import projectsRouter from "./projects/index.js";
import rolesRouter from "./roles/index.js";
import usersRouter from "./users/index.js";
import invitationsRouter from "./invitations/index.js";
import teamsRouter from "./teams/index.js";
import clientsRouter from "./clients/index.js";

// Everything scoped to a single company lives under /company/:companyId, so
// companyId is always a path param available to the RBAC guards in the actions.
const router = Router({ mergeParams: true });

router.route("/").delete(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId },
      user,
    } = req;

    const { status, message, company } = await deleteCompany({
      userId: user.id,
      companyId,
    });

    res.status(status).send({ message, company });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error deleting this company",
    } = caught;

    res.status(status).send({ error });
  }
});

router.use("/projects", projectsRouter);
router.use("/roles", rolesRouter);
router.use("/users", usersRouter);
router.use("/invitations", invitationsRouter);
router.use("/teams", teamsRouter);
router.use("/clients", clientsRouter);

export default router;
