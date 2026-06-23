import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectCompanyInvitations } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListCompanyInvitationsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
}).meta({ id: "GET /api/company/{companyId}/invitations", route: "GET /api/company/{companyId}/invitations" });

export type ListCompanyInvitationsProps = z.infer<
  typeof ListCompanyInvitationsSchema
>;

// Lists the company's pending invitations.
export const listCompanyInvitations = async (
  props: ListCompanyInvitationsProps,
) => {
  try {
    ListCompanyInvitationsSchema.parse(props);

    const { userId, companyId } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "read",
    });

    const invitations = await selectCompanyInvitations({ companyId });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Invitations fetched",
      invitations,
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
      error = ["There was an error fetching the invitations"],
    } = caught;

    throw { status, error };
  }
};
