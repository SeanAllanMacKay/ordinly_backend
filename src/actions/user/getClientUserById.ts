import { Company, User } from "../../services/database";

import type { APIResponse } from "../../routers/types";
import { HTTP_STATUSES } from "../HTTP_STATUSES";
import { FlattenMaps } from "mongoose";
import { CompanyDocument } from "../../services/database/types";

type GetClientUserByIdProps = {
  _id: string;
};

export type ClientUserType = {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  companies: (FlattenMaps<CompanyDocument> &
    Required<{ _id: FlattenMaps<unknown> }>)[];
  projects: string[];
};

export const getClientUserById = async ({
  _id,
}: GetClientUserByIdProps): Promise<APIResponse<{ user: ClientUserType }>> => {
  try {
    const account = await User.findOne(
      { _id },
      {
        _id: 1,
        name: 1,
        email: 1,
        isVerified: 1,
      }
    ).lean();

    if (!account) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: "Account not found",
      };
    }

    const companies = await Company.find(
      { "workers.userId": account?._id },
      { _id: 1, name: 1 }
    ).lean();

    return {
      status: HTTP_STATUSES.SUCCESS.ACCEPTED,
      message: "Account found",
      user: { ...account, _id, companies: companies as any },
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
