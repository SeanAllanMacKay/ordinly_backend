import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken.js";
import requireVerified from "../../services/auth/requireVerified.js";
import { createCompany } from "../../actions/company/createCompany.js";
import { HTTP_STATUSES } from "../../actions/index.js";
import { listCompanies } from "../../actions/company/listCompanies.js";
import { singleFileHandler } from "../../services/files/index.js";
import companyIdRouter from "./[companyId]/index.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(verifyToken, async (req: any, res) => {
    try {
      const {
        query: { page },
        user,
      } = req;

      const { status, message, companies, totalItems, totalPages } =
        await listCompanies({
          userId: user.id,
          page,
        });

      res.status(status).send({ message, companies, totalItems, totalPages });
    } catch (caught: any) {
      const {
        status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        error = "There was an error fetching your companies",
      } = caught;

      res.status(status).send({ error });
    }
  })
  .post(
    verifyToken,
    requireVerified,
    singleFileHandler({ fieldName: "logo", uploadType: "image" }),
    async (req: any, res) => {
      try {
        const { body, user, logo } = req;

        const { status, message, company } = await createCompany({
          ...body,
          userId: user.id,
          logo,
          referer: req.headers.referer?.split("?")[0] as string,
        });

        res.status(status).send({ message, company });
      } catch (caught: any) {
        console.log({ caught });
        const {
          status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error = "There was an error creating this company",
        } = caught;

        res.status(status).send({ error });
      }
    },
  );

router.use("/:companyId", companyIdRouter);

export default router;
