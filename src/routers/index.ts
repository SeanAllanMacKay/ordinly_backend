import { Router } from "express";

import userRouter from "./user/index.js";
import taskRouter from "./task/index.js";
import companyRouter from "./company/index.js";
import rolesRouter from "./roles/index.js";
import metadataRouter from "./metadata.js";
import { MAPS_PATH, mapsMiddleware } from "../services/maps/index.js";
import verifyToken from "../services/auth/verifyToken.js";

const router = Router({ mergeParams: true });

router.use("/user", userRouter);
router.use("/task", taskRouter);
router.use("/company", companyRouter);
router.use("/roles", rolesRouter);
router.use("/metadata", metadataRouter);

router.use(MAPS_PATH, verifyToken, mapsMiddleware);

export default router;
