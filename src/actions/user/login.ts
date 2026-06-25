import bcrypt from "bcryptjs";
import auth from "../../services/auth/index.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import * as z from "zod";
import { selectUserByEmail, restoreAccount } from "../../services/db/index.js";
import { cancelHardDeleteJob } from "../../services/jobs/index.js";
import send from "../../services/email/send.js";

const LoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string("Invalid password"),
}).meta({ id: "POST /api/user/login", route: "POST /api/user/login" });

type LoginProps = {
  email: string;
  password: string;
  referer?: string;
};

export const login = async ({ email, password, referer }: LoginProps) => {
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

    // Auto-restore: a successful login during the deletion grace window revives
    // the account (and everything it owns), cancels the scheduled hard delete,
    // and confirms by email.
    if (user.deletedDate) {
      await restoreAccount({ userId: id, deletedAt: user.deletedDate });
      if (user.hardDeleteJobId) {
        await cancelHardDeleteJob({ jobId: user.hardDeleteJobId });
      }
      await send({ email: user.email, type: "accountRestored", referer });
      // Reflect the restore in the response rather than the now-stale row.
      restUser.deletedDate = null;
      restUser.hardDeleteJobId = null;
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
