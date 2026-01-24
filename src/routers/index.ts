import { Router } from "express";

import userRouter from "./user";
import projectsRouter from "./projects";
import companyRouter from "./company";

const router = Router({ mergeParams: true });

router.use("/user", userRouter);
router.use("/projects", projectsRouter);
router.use("/company", companyRouter);

export default router;
