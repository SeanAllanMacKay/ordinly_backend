import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import {
  listTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  HTTP_STATUSES,
} from "../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/teams — list teams
// POST /api/company/:companyId/teams — create a team
router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId },
        user,
      } = req;

      const { status, message, teams } = await listTeams({
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, teams });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the teams",
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

      const { status, message, team } = await createTeam({
        ...body,
        userId: user.id,
        companyId,
      });

      res.status(status).send({ message, team });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error creating the team",
      } = caught;

      res.status(status).send({ error });
    }
  });

// GET / PUT / DELETE /api/company/:companyId/teams/:teamId
router
  .route("/:teamId")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, teamId },
        user,
      } = req;

      const { status, message, team } = await getTeam({
        userId: user.id,
        companyId,
        teamId,
      });

      res.status(status).send({ message, team });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching the team",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .put(verifyToken, async (req: any, res) => {
    try {
      const {
        body,
        params: { companyId, teamId },
        user,
      } = req;

      const { status, message, team } = await updateTeam({
        ...body,
        userId: user.id,
        companyId,
        teamId,
      });

      res.status(status).send({ message, team });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error updating the team",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, teamId },
        user,
      } = req;

      const { status, message } = await deleteTeam({
        userId: user.id,
        companyId,
        teamId,
      });

      res.status(status).send({ message });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error deleting the team",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
