import send from "../../services/email/index.js";
import type { APIResponse } from "../../routers/types.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import { selectUserByEmail } from "../../services/db/index.js";
import * as z from "zod";

const ResendVerificationSchema = z.object({
  email: z.email(),
  referer: z.string().optional(),
});

type ResendVerificationProps = {
  email: string;
  referer: string;
};

const successMessage = "Verification email sent!";

export const resendVerification = async ({
  email,
  referer,
}: ResendVerificationProps): Promise<APIResponse> => {
  try {
    ResendVerificationSchema.parse({ email, referer });

    const account = await selectUserByEmail({ email });

    if (!account) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    if (account.isVerified) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.CONFLICT,
        error: ["Account has already been verified"],
      };
    }

    await send({
      email: account.email,
      type: "successfulSignUp",
      verificationCode: account.verificationCode,
      referer,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: successMessage,
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error resending your verification email"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
