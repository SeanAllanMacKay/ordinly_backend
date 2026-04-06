import { Router } from "express";

import userRouter from "./user";
import projectsRouter from "./projects";
import taskRouter from "./task";
import companyRouter from "./company";

const router = Router({ mergeParams: true });

router.use("/user", userRouter);
router.use("/projects", projectsRouter);
router.use("/task", taskRouter);
router.use("/company", companyRouter);

export default router;
