import bcrypt from "bcryptjs";
import send from "../../services/email/index.js";
import auth from "../../services/auth/index.js";
import { HTTP_STATUSES } from "../index.js";
import * as z from "zod";

import {
  selectUserByEmail,
  insertUser,
  InsertUserProps,
} from "../../services/db/index.js";

type SignUpProps = InsertUserProps & {
  referer: string;
};

const successMessage = "Verification email sent!";

const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  referer: z.string().optional(),
  name: z.string(),
});

export const signUp = async ({
  email,
  password,
  referer,
  ...rest
}: SignUpProps) => {
  try {
    SignUpSchema.parse({ email, password, referer, ...rest });

    const existingAccount = await selectUserByEmail({ email });

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

      const newUser = await insertUser({
        ...rest,
        email,
        password: hashedPassword,
      });

      await send({
        email,
        type: "successfulSignUp",
        verificationCode: newUser.verificationCode,
        referer,
      });

      // Log the new (still unverified) user in immediately so they reach value
      // without a separate login step. The FE shows an "unverified" banner.
      const newToken = auth.sign({ id: newUser.id });

      return {
        status: HTTP_STATUSES.SUCCESS.CREATED,
        message: successMessage,
        user: newUser,
        newToken,
      };
    }
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error creating this account"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
