import { Router } from "express";

import userRouter from "./user/index.js";
import projectsRouter from "./projects/index.js";
import taskRouter from "./task/index.js";
import companyRouter from "./company/index.js";
import metadataRouter from "./metadata.js";

const router = Router({ mergeParams: true });

router.use("/user", userRouter);
router.use("/projects", projectsRouter);
router.use("/task", taskRouter);
router.use("/company", companyRouter);
router.use("/metadata", metadataRouter);

export default router;
