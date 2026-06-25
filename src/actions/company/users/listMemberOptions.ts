import { HTTP_STATUSES } from "../../HTTP_STATUSES.js";
import { selectMemberOptions } from "../../../services/db/index.js";
import { assertCompanyPermission } from "../../permissions/index.js";
import * as z from "zod";

const ListMemberOptionsSchema = z.object({
  userId: z.string("Invalid userId"),
  companyId: z.string("Invalid companyId"),
  search: z.string().optional(),
}).meta({
  id: "GET /api/company/{companyId}/users/options",
  route: "GET /api/company/{companyId}/users/options",
});

export type ListMemberOptionsProps = z.infer<typeof ListMemberOptionsSchema>;

// Slimmed-down { value, label } member list for FE selects (value = userId), gated
// by workers:read — the same permission as the paginated members list.
export const listMemberOptions = async (props: ListMemberOptionsProps) => {
  try {
    ListMemberOptionsSchema.parse(props);

    const { userId, companyId, search } = props;

    await assertCompanyPermission({
      userId,
      companyId,
      key: "workers",
      action: "read",
    });

    const options = await selectMemberOptions({ companyId, search });

    return {
      status: options.length
        ? HTTP_STATUSES.SUCCESS.OK
        : HTTP_STATUSES.SUCCESS.EMPTY,
      message: "Member options fetched",
      options,
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
      error = ["There was an error fetching the member options"],
    } = caught;

    throw { status, error };
  }
};
