import bcrypt from "bcryptjs";

import { ObjectId } from "mongodb";

import { User } from "../../services/database";

import send from "../../services/email";

import { ClientUserType, HTTP_STATUSES } from "../";

import type { APIResponse } from "../../routers/types";
import type { UserType } from "../../services/database/types";

type SignUpUserType = Omit<
  UserType,
  | "accountType"
  | "isPublic"
  | "isVerified"
  | "verificationCode"
  | "companies"
  | "projects"
  | "profile"
>;

type SignUpProps = SignUpUserType & {
  referer: string;
};

const successMessage = "Verification email sent!";

export const signUp = async ({
  email,
  password,
  referer,
  name,
  ...rest
}: SignUpProps): Promise<APIResponse<{ user?: ClientUserType }>> => {
  try {
    const existingAccount = await User.findOne({ email: email.toLowerCase() });

    if (existingAccount) {
      if (existingAccount.isVerified) {
        await send({ email, type: "attemptedSignUp" });
      } else {
        await send({
          email,
          type: "attemptedSignUpWithUnverified",
          verificationCode: existingAccount.verificationCode,
        });
      }

      return { status: HTTP_STATUSES.SUCCESS.CREATED, message: successMessage };
    } else {
      const hashedPassword = await bcrypt.hashSync(password, 8);

      const newUser = await User.create({
        _id: new ObjectId(),
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        isVerified: false,
        accountType: "basic",
        isPublic: false,
        ...rest,
      });

      if (!newUser) {
        throw {
          status: HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
          error: "There was an error creating this account",
        };
      }

      await send({
        email,
        type: "successfulSignUp",
        verificationCode: newUser.verificationCode,
        referer,
      });

      return {
        status: HTTP_STATUSES.SUCCESS.CREATED,
        message: successMessage,
        user: {
          _id: newUser._id?.toString() ?? "",
          name,
          email,
          isVerified: false,
          companies: [],
          projects: [],
        },
      };
    }
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error creating this account",
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
