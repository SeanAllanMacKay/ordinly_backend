import { Router } from "express";

import { verifyAccount } from "../../actions/index.js";

const router = Router({ mergeParams: true });

router.route("/").post(async (req: any, res) => {
  try {
    const {
      body: { code },
    } = req;

    const { status, message } = await verifyAccount({
      code,
      referer: req.headers.referer?.split("?")[0] as string,
    });

    res.status(status).send({ message });
  } catch (caught: any) {
    const { status, error } = caught;

    res.status(status).send({ error });
  }
});

export default router;
