import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listCompanyMembers,
  listMemberOptions,
  getCompanyMember,
  inviteUser,
  updateMemberRoles,
  removeCompanyMember,
  HTTP_STATUSES,
} from "../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/users/options — slim { value, label } list for FE selects
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId },
      user,
    } = req;

    const { status, message, options } = await listMemberOptions({
      userId: user.id,
      companyId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the member options",
    } = caught;

    res.status(status).send({ error });
  }
});

// GET /api/company/:companyId/users — list members
// POST /api/company/:companyId/users — invite a person by email
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        query: { page },
        params: { companyId },
        user,
      } = req;

      const { status, message, members, totalItems, totalPages } =
        await listCompanyMembers({
          userId: user.id,
          companyId,
          page,
        });

      res.status(status).send({ message, members, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the members",
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

      const { status, message, invitation } = await inviteUser({
        ...body,
        userId: user.id,
        companyId,
        referer: req.headers.referer?.split("?")[0] as string,
      });

      res.status(status).send({ message, invitation });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error inviting this person",
      } = caught;

      res.status(status).send({ error });
    }
  });

// GET / PUT (roles) / DELETE /api/company/:companyId/users/:userId
router
  .route("/:userId")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, userId: memberId },
        user,
      } = req;

      const { status, message, member } = await getCompanyMember({
        userId: user.id,
        companyId,
        memberId,
      });

      res.status(status).send({ message, member });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the member",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, userId: memberId },
        user,
      } = req;

      const { status, message } = await updateMemberRoles({
        ...body,
        userId: user.id,
        companyId,
        memberId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the member's roles",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, userId: memberId },
        user,
      } = req;

      const { status, message } = await removeCompanyMember({
        userId: user.id,
        companyId,
        memberId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error removing the member",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
