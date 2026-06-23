import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listPermissionCatalog,
  listCompanyRoles,
  createCompanyRole,
  getCompanyRole,
  updateCompanyRole,
  deleteCompanyRole,
  getRolePermissions,
  updateRolePermissions,
  HTTP_STATUSES,
} from "../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/roles/catalog?scope=company|project — dropdown options
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

// GET /api/company/:companyId/roles — list the company's roles + system roles
// POST /api/company/:companyId/roles — create a company role
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId },
        user,
      } = req;

      const { status, message, roles } = await listCompanyRoles({
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, roles });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the roles",
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

      const { status, message, role } = await createCompanyRole({
        ...body,
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, role });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error creating the role",
      } = caught;

      res.status(status).send({ error });
    }
  });

// GET /api/company/:companyId/roles/:roleId/permissions?scope=company|project
// PUT /api/company/:companyId/roles/:roleId/permissions
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

// GET / PUT / DELETE /api/company/:companyId/roles/:roleId
router
  .route("/:roleId")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, roleId },
        user,
      } = req;

      const { status, message, role } = await getCompanyRole({
        userId: user.id,
        companyId,
        roleId,
      });

      res.status(status).send({ message, role });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the role",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, roleId },
        user,
      } = req;

      const { status, message, role } = await updateCompanyRole({
        ...body,
        userId: user.id,
        companyId,
        roleId,
      });

      res.status(status).send({ message, role });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the role",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, roleId },
        user,
      } = req;

      const { status, message } = await deleteCompanyRole({
        userId: user.id,
        companyId,
        roleId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting the role",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
