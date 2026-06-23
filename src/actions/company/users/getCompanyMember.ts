import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectCompanyMember } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const GetCompanyMemberSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  memberId: z.string("Invalid memberId"),
});

export type GetCompanyMemberProps = z.infer<typeof GetCompanyMemberSchema>;

// Fetches a single company member (by their user id) with their roles.
export const getCompanyMember = async (props: GetCompanyMemberProps) => {
  try {
    GetCompanyMemberSchema.parse(props);

    const { userId, companyId, memberId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "read",
    });

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

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Member fetched",
      member,
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
      error = ["There was an error fetching the member"],
    } = caught;

    throw { status, error };
  }
};
