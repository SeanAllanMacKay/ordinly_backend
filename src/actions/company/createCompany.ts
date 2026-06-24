import {
  insertCompany,
  InsertCompanyProps,
  selectUserById,
} from "../../services/db/index.js";
import { fileService } from "../../services/files/index.js";
import { htmlToPlaintext } from "../../services/formatting/index.js";
import send from "../../services/email/index.js";
import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import { randomUUID as uuid } from "crypto";
import * as z from "zod";

const CreateCompanySchema = z.object({
  userId: z.string("Invalid userId"),
  name: z.string("Name must be a string"),
  description: z.string("Description must be a string if passed").optional(),
  referer: z.string().optional(),
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
}).meta({ id: "POST /api/company", route: "POST /api/company", multipart: { file: "logo" } });

export const createCompany = async (
  companyProps: InsertCompanyProps & {
    logo: Express.Multer.File;
    referer?: string;
  },
) => {
  try {
    CreateCompanySchema.parse(companyProps);

    const companyId = uuid();

    let logo = undefined;

    if (companyProps.logo) {
      logo = await fileService.uploadCompanyLogo({
        file: companyProps.logo,
        companyId,
      });
    }

    const newCompany = await insertCompany({
      ...companyProps,
      companyId,
      logo,
      shortDescription: htmlToPlaintext(companyProps.description),
    });

    // Welcome the creator and kick off their 14-day free trial. Best-effort:
    // a failure here shouldn't block company creation.
    try {
      const creator = await selectUserById({ userId: companyProps.userId });

      if (creator?.email) {
        await send({
          email: creator.email,
          type: "companyCreated",
          companyName: newCompany.name,
          referer: companyProps.referer,
        });
      }
    } catch (emailError) {
      console.log("companyCreated email failed", emailError);
    }

    return {
      status: HTTP_STATUSES.SUCCESS.CREATED,
      message: "Company successfully created",
      company: newCompany,
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
      error = ["There was an error creating this company"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
