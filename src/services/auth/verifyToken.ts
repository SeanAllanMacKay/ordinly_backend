import auth from "./";

import { getClientUserById } from "../../actions";

import type { RequestHandler } from "express";

// @ts-ignore
const verifyToken: RequestHandler = async (req, res, next) => {
  const {
    cookies,
    signedCookies: { auth: token },
  } = req;

  console.log("cookies", cookies);
  console.log("token", token);

  if (token) {
    const verifiedToken = (await auth.verify(token)) as { _id: string };

    console.log("verifiedToken", verifiedToken);

    if (verifiedToken) {
      const { user } = await getClientUserById({ _id: verifiedToken._id });

      console.log("user", user._id);
      // @ts-ignore
      req.user = user;

      next();
    } else {
      return res.status(401).send({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).send({ error: "Unauthorized" });
  }
};

export default verifyToken;
