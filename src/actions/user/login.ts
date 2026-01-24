import bcrypt from "bcryptjs";

import { User } from "../../services/database";

import auth from "../../services/auth";

import { type UserType } from "../../services/database/types";
import { HTTP_STATUSES } from "../HTTP_STATUSES";

type LoginProps = {
  email: string;
  password: string;
};

export const login = async ({ email, password }: LoginProps) => {
  try {
    if (!email) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: "An email address is required",
      };
    }

    if (!password) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: "A password is required",
      };
    }

    const user = await User.findOne(
      { email: email.toLowerCase() },
      {
        _id: 1,
        password: 1,
        name: 1,
        email: 1,
        isVerified: 1,
        companies: 1,
        projects: 1,
      }
    ).lean();

    console.log(user);

    if (!user) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.UNAUTHORIZED,
        error: "That email/password combination didn't match our records",
      };
    }

    const { _id, password: dbPassword, ...restUser } = user;

    if (!bcrypt.compareSync(password, dbPassword)) {
      console.log("incorrect password");
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.UNAUTHORIZED,
        error: "That email/password combination didn't match our records",
      };
    }

    const newToken = auth.sign({ _id });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      user: { _id, ...restUser } as Omit<
        UserType,
        "password" | "verificationCode"
      >,
      newToken,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "We weren't able to log you in",
    } = caught;

    throw { status: status, error: error };
  }
};
