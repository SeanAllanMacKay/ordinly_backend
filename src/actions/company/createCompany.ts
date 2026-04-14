import { insertCompany, InsertCompanyProps } from "../../services/db/index.js";
import { uploadSingle } from "../../services/files/index.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { randomUUID as uuid } from "crypto";
import * as z from "zod";

const CreateCompanySchema = z.object({
  userId: z.string("Invalid userId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  logo: z
    .object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      size: z.number(),
      buffer: z.custom<Buffer>((data) => data instanceof Buffer, {
        message: "Buffer is required",
      }),
    })
    .optional(),
});

export const createCompany = async (
  companyProps: InsertCompanyProps & { logo: Express.Multer.File },
) => {
  try {
    CreateCompanySchema.parse(companyProps);

    const companyId = uuid();

    let logo = undefined;

    if (companyProps.logo) {
      logo = await uploadSingle({
        file: companyProps.logo,
        path: "document",
        companyId,
      });
    }

    const newCompany = await insertCompany({
      ...companyProps,
      companyId,
      logo,
    });

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Company successfully created",
      company: newCompany,
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
      error = ["There was an error creating this company"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
