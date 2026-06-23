import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import {
  listPermissionCatalog,
  getRolePermissions,
  updateRolePermissions,
  HTTP_STATUSES,
} from "../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/roles/catalog?scope=company|project — dropdown options
router.route("/catalog").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { scope = "company" },
    } = req;

    const { status, message, permissions } = await listPermissionCatalog({
      scope,
    });

    res.status(status).send({ message, permissions });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the permission catalog",
    } = caught;

    res.status(status).send({ error });
  }
});

// GET /api/roles/:roleId/permissions?scope=company|project — current values
router
  .route("/:roleId/permissions")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { roleId },
        query: { scope = "company" },
        user,
      } = req;

      const { status, message, permissions } = await getRolePermissions({
        userId: user.id,
        roleId,
        scope,
      });

      res.status(status).send({ message, permissions });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the role's permissions",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { roleId },
        body,
        user,
      } = req;

      const { status, message, assignments } = await updateRolePermissions({
        ...body,
        roleId,
        userId: user.id,
      });

      res.status(status).send({ message, assignments });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the role's permissions",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
