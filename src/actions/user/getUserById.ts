import { HTTP_STATUSES } from "../HTTP_STATUSES";
import { FlattenMaps } from "mongoose";
import { CompanyDocument } from "../../services/database/types";
import { selectUserById } from "../../services/db";

type GetClientUserByIdProps = {
  id: string;
};

export type ClientUserType = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  companies: (FlattenMaps<CompanyDocument> &
    Required<{ _id: FlattenMaps<unknown> }>)[];
  projects: string[];
};

export const getUserById = async ({ id }: GetClientUserByIdProps) => {
  try {
    const user = await selectUserById({ userId: id });

    if (!user) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Account not found"],
      };
    }

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Account found",
      user,
    };
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching this account",
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
