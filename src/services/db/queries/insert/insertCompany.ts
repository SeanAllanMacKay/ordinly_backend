import {
  Company,
  CompanyProfile,
  Document,
  UserCompany,
  UserCompanyRole,
  db,
} from "../../index.js";
import { uploadSingle } from "../../../files/index.js";

export type InsertCompanyProps = {
  userId: string;
  logo?: Awaited<ReturnType<typeof uploadSingle>>;
  companyId?: string;
} & Omit<
  typeof Company.$inferInsert,
  | "id"
  | "owner"
  | "profile"
  | "createdDate"
  | "createdBy"
  | "deletedDate"
  | "deletedBy"
  | "logo"
>;

export const insertCompany = async ({
  userId,
  name,
  companyId,
  logo,
}: InsertCompanyProps) => {
  return await db.transaction(async (transaction) => {
    let logoDocument = undefined;

    if (logo) {
      const [insertedLogoDocument] = await transaction
        .insert(Document)
        .values({
          name: logo.fileName,
          externalId: logo.fileId,
          externalURL: logo.url,
          createdBy: userId,
        })
        .returning();

      logoDocument = insertedLogoDocument;
    }

    const [company] = await transaction
      .insert(Company)
      .values({
        id: companyId,
        owner: userId,
        name,
        createdBy: userId,
        logo: logoDocument?.id,
      })
      .returning();

    await transaction
      .insert(CompanyProfile)
      .values({
        companyId: company.id,
      })
      .returning();

    const [userCompany] = await transaction
      .insert(UserCompany)
      .values({
        userId,
        companyId: company.id,
        assignedBy: userId,
      })
      .returning();

    await transaction.insert(UserCompanyRole).values({
      userCompanyId: userCompany.id,
      //TODO: Make this less fragile
      roleId: "c18d5e2a-9a2d-42c2-8515-a270b5b970db",
    });

    return company;
  });
};
