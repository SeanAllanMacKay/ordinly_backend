import bcrypt from "bcryptjs";
import auth from "../../services/auth";
import { HTTP_STATUSES } from "../HTTP_STATUSES";
import * as z from "zod";
import { selectUserByEmail } from "../../services/db";

const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string("Invalid password"),
});

type LoginProps = {
  email: string;
  password: string;
};

export const login = async ({ email, password }: LoginProps) => {
  try {
    LoginSchema.parse({ email, password });

    const user = await selectUserByEmail({ email });

    if (!user) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.UNAUTHORIZED,
        error: ["That email/password combination didn't match our records"],
      };
    }

    const { id, password: dbPassword, ...restUser } = user;

    if (!bcrypt.compareSync(password, dbPassword)) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.UNAUTHORIZED,
        error: ["That email/password combination didn't match our records"],
      };
    }

    const newToken = auth.sign({ id });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      user: { id, ...restUser },
      newToken,
    };
  } catch (caught: any) {
    console.log(caught);
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["We weren't able to log you in"],
    } = caught;

    throw { status: status, error: error };
  }
};
