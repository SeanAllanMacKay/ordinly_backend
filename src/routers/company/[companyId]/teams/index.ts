import { Router } from "express";
import verifyToken from "../../../../services/auth/verifyToken.js";
import { singleFileHandler } from "../../../../services/files/index.js";
import {
  listTeams,
  listTeamOptions,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  updateTeamProfilePicture,
  removeTeamProfilePicture,
  HTTP_STATUSES,
} from "../../../../actions/index.js";

const router = Router({ mergeParams: true });

// GET /api/company/:companyId/teams/options — slim { value, label } list for FE selects
router.route("/options").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { search },
      params: { companyId },
      user,
    } = req;

    const { status, message, options } = await listTeamOptions({
      userId: user.id,
      companyId,
      search,
    });

    res.status(status).send({ message, options });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the team options",
    } = caught;

    res.status(status).send({ error });
  }
});

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
  .post(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
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
          profilePicture: req.profilePicture,
        });

        res.status(status).send({ message, team });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error creating the team",
        } = caught;

        res.status(status).send({ error });
      }
    },
  );

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

// PUT / DELETE /api/company/:companyId/teams/:teamId/profile-picture
router
  .route("/:teamId/profile-picture")
  .put(
    verifyToken,
    singleFileHandler({ fieldName: "profilePicture", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const {
          params: { companyId, teamId },
          user,
        } = req;

        const { status, message, team } = await updateTeamProfilePicture({
          userId: user.id,
          companyId,
          teamId,
          file: req.profilePicture,
        });

        res.status(status).send({ message, team });
      } catch (caught: any) {
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error updating the team profile picture",
        } = caught;

        res.status(status).send({ error });
      }
    },
  )
  .delete(verifyToken, async (req: any, res) => {
    try {
      const {
        params: { companyId, teamId },
        user,
      } = req;

      const { status, message, team } = await removeTeamProfilePicture({
        userId: user.id,
        companyId,
        teamId,
      });

      res.status(status).send({ message, team });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error removing the team profile picture",
      } = caught;

      res.status(status).send({ error });
    }
  });

export default router;
