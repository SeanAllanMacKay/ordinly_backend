import { HTTP_STATUSES } from "../../actions/index.js";

import type { RequestHandler } from "express";

// Gates a route behind email verification. Must run AFTER `verifyToken`, which
// attaches `req.user` (including `isVerified`, re-fetched fresh each request).
// Returns 403 (vs verifyToken's 401) so the FE can tell "logged in but
// unverified" apart from "not logged in".
//
// Usage: router.route("/").post(verifyToken, requireVerified, handler)
// @ts-ignore
const requireVerified: RequestHandler = (req, res, next) => {
  // @ts-ignore
  if (!req.user?.isVerified) {
    return res.status(HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN).send({
      error: "Please verify your email to continue",
    });
  }

  next();
};

export default requireVerified;
