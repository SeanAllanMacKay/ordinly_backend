import auth from "./index.js";

import { getUserById } from "../../actions/index.js";

import type { RequestHandler } from "express";

// @ts-ignore
const verifyToken: RequestHandler = async (req, res, next) => {
  const {
    signedCookies: { auth: token },
  } = req;

  if (token) {
    const verifiedToken = (await auth.verify(token)) as { id: string };

    if (verifiedToken) {
      try {
        const { user } = await getUserById({ id: verifiedToken.id });

        // No live user (e.g. soft-deleted during the deletion grace window):
        // treat the cookie as invalid.
        if (!user) {
          return res.status(401).send({ error: "Unauthorized" });
        }

        // @ts-ignore
        req.user = user;

        next();
      } catch {
        // getUserById throws NOT_FOUND for missing/soft-deleted accounts.
        return res.status(401).send({ error: "Unauthorized" });
      }
    } else {
      return res.status(401).send({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
};

export default verifyToken;
