import { Router } from "express";
import verifyToken from "../../services/auth/verifyToken";
import { createCompany } from "../../actions/company/createCompany";
import { HTTP_STATUSES } from "../../actions";
import { listCompanies } from "../../actions/company/listCompanies";

const router = Router({ mergeParams: true });

router.route("/").get(verifyToken, async (req: any, res) => {
  try {
    const {
      query: { page },
      user,
    } = req;

    const { status, message, companies, totalItems, totalPages } =
      await listCompanies({
        userId: user._id,
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
});

router.route("/").post(verifyToken, async (req: any, res) => {
  try {
    const { body, user } = req;

    const { status, message } = await createCompany({
      ...body,
      userId: user._id,
    });

    res.status(status).send({ message });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating this company",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
