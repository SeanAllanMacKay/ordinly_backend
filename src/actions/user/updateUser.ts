import * as z from "zod";

import type { APIResponse } from "../../routers/types.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { updateUserById } from "../../services/db/index.js";

const UpdateUserSchema = z
  .object({
    userId: z.string("Invalid userId"),
    // Light BCP-47 shape check (e.g. "en", "en-US", "pt-BR"). The FE owns the
    // supported-locale set, so we only guard against obviously malformed values.
    preferredLanguage: z
      .string()
      .regex(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/, "Invalid language code")
      .optional(),
  })
  .meta({ id: "PATCH /api/user", route: "PATCH /api/user" });

export type UpdateUserProps = z.infer<typeof UpdateUserSchema>;

/**
 * Update the authenticated user's editable profile fields. Currently handles the
 * i18n `preferredLanguage`; the optional-field shape leaves room to grow (name,
 * etc.) without changing the endpoint contract.
 */
export const updateUser = async (props: UpdateUserProps): Promise<APIResponse> => {
  try {
    UpdateUserSchema.parse(props);
    const { userId, preferredLanguage } = props;

    const updated = await updateUserById({ userId, preferredLanguage });
    if (!updated) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    const { password, verificationCode, ...user } = updated;

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Profile updated",
      user,
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
      error = ["There was an error updating your profile"],
    } = caught;

    throw { status, error };
  }
};
