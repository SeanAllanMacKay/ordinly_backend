import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import {
  selectCompanyMember,
  selectCompanyById,
  removeCompanyMember as removeCompanyMemberQuery,
} from "../../../services/db/index.js";
import {
  assertCompanyPermission,
  assertNotPersonalCompany,
} from "../../permissions/index.js";
import send from "../../../services/email/index.js";
import * as z from "zod";

const RemoveCompanyMemberSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  memberId: z.string("Invalid memberId"),
});

export type RemoveCompanyMemberProps = z.infer<
  typeof RemoveCompanyMemberSchema
>;

// Removes a member from the company. The owner can't be removed.
export const removeCompanyMember = async (props: RemoveCompanyMemberProps) => {
  try {
    RemoveCompanyMemberSchema.parse(props);

    const { userId, companyId, memberId } = props;

    await assertNotPersonalCompany({ userId, companyId });
    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "delete",
    });

    const company = await selectCompanyById({ companyId });

    if (company?.owner === memberId) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.FORBIDDEN,
        error: ["The company owner can't be removed"],
      };
    }

    const { exists, member } = await selectCompanyMember({
      userId: memberId,
      companyId,
    });

    if (!exists) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Member not found"],
      };
    }

    await removeCompanyMemberQuery({
      companyId,
      userId: memberId,
      removedBy: userId,
    });

    if (member?.user?.email) {
      await send({
        email: member.user.email,
        type: "removedFromCompany",
        companyName: company?.name ?? "a company",
      });
    }

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Member removed",
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
      error = ["There was an error removing the member"],
    } = caught;

    throw { status, error };
  }
};
