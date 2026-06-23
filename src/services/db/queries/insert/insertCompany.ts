import { and, eq, isNull } from "drizzle-orm";

import {
  Company,
  CompanyProfile,
  CompanyRole,
  Document,
  UserCompany,
  UserCompanyRole,
  db,
} from "../../index.js";
import { fileService } from "../../../files/index.js";

export type InsertCompanyProps = {
  userId: string;
  logo?: Awaited<ReturnType<typeof fileService.uploadCompanyLogo>>;
  companyId?: string;
  description?: string;
  shortDescription?: string;
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
  description,
  shortDescription,
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
          externalPath: logo.path,
          createdBy: userId,
          isPublic: logo.isPublic,
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
        description: description ?? "",
        shortDescription: shortDescription ?? "",
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

    const [ownerRole] = await transaction
      .select({ id: CompanyRole.id })
      .from(CompanyRole)
      .where(
        and(eq(CompanyRole.name, "Owner"), isNull(CompanyRole.companyId)),
      );

    if (!ownerRole) {
      throw new Error(
        'Global "Owner" CompanyRole not found — run seedCompanyRoles() first.',
      );
    }

    await transaction.insert(UserCompanyRole).values({
      userCompanyId: userCompany.id,
      roleId: ownerRole.id,
    });

    return company;
  });
};
