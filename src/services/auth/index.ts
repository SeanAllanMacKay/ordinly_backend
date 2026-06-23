import jwt from "jsonwebtoken";

import type { CookieOptions } from "express";

const JWT_PASSPHRASE: string = process.env["JWT_PASSPHRASE"] || "";

// Single source of truth for the `auth` cookie options. Reused when setting the
// cookie (login, sign-up) and clearing it (logout) so the options never drift —
// mismatched options would leave a cookie the browser won't send back.
export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "none",
  secure: true,
};

export default {
  sign: (payload: any) => {
    return jwt.sign(payload, JWT_PASSPHRASE, { expiresIn: 86400 });
  },
  verify: (token: any) => {
    try {
      return jwt.verify(token, JWT_PASSPHRASE);
    } catch (err) {
      return false;
    }
  },
  decode: (token: any) => {
    return jwt.decode(token);
  },
};
