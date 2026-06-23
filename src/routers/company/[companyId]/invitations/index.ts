import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listCompanyInvitations,
  revokeCompanyInvitation,
  HTTP_STATUSES,
} from "../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/invitations — list pending invitations
router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId },
      user,
    } = req;

    const { status, message, invitations } = await listCompanyInvitations({
      userId: user.id,
      companyId,
    });

    res.status(status).send({ message, invitations });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the invitations",
    } = caught;

    res.status(status).send({ error });
  }
});

// DELETE /api/company/:companyId/invitations/:invitationId — revoke
router.route("/:invitationId").delete(verifyToken, async (req: any, res) => {
  try {
    const {
      params: { companyId, invitationId },
      user,
    } = req;

    const { status, message } = await revokeCompanyInvitation({
      userId: user.id,
      companyId,
      invitationId,
    });

    res.status(status).send({ message });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error revoking the invitation",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
