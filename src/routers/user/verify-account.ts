import { Router } from "express";

import { verifyAccount } from "../../actions";

const router = Router({ mergeParams: true });

router.route("/").post(async (req: any, res) => {
  try {
    const {
      body: { code },
    } = req;

    const { status, message } = await verifyAccount({
      code,
    });

    res.status(status).send({ message });
  } catch (caught: any) {
    const { status, error } = caught;

    res.status(status).send({ error });
  }
});

export default router;
