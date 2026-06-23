import { Router } from "express";

import projectsRouter from "./projects/index.js";

// Everything scoped to a single company lives under /company/:companyId, so
// companyId is always a path param available to the RBAC guards in the actions.
const router = Router({ mergeParams: true });

router.use("/projects", projectsRouter);

export default router;
