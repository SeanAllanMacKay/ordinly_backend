import mongoose from "mongoose";

import { Company, User } from "../../services/database";

export type CreateCompanyProps = {
  userId: string;
  name: string;
  description?: string;
};

export const createCompany = async ({
  userId,
  name,
  description,
}: CreateCompanyProps) => {
  try {
    const user = await User.findOne({
      _id: userId,
    });

    if (!user) {
      throw {
        status: 404,
        error: "User not found",
      };
    }

    const now = new Date();

    const newCompany = await Company.create({
      owner: userId,
      name,
      createdBy: userId,
      createdAt: now,
      workers: [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          status: "active",
          email: user.email,
          role: "owner",
          addedAt: now,
        },
      ],
      profile: {},
      projects: [],
      clients: [],
      description,
    });

    if (!newCompany) {
      throw { status: 500, error: "There was an error creating this company" };
    }

    return {
      status: 201,
      message: "Company successfully created",
      companyId: newCompany._id,
    };
  } catch (caught: any) {
    const { status = 500, error = "There was an error creating this company" } =
      caught;

    console.log(caught);

    throw {
      status: status,
      error: error,
    };
  }
};
