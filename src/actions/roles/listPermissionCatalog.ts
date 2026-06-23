import { HTTP_STATUSES } from "../HTTP_STATUSES.js";

import {
  selectPermissionCatalog,
  SelectPermissionCatalogProps,
} from "../../services/db/index.js";
import * as z from "zod";

const ListPermissionCatalogSchema = z.object({
  scope: z.enum(["company", "project"], "Invalid scope"),
});

// Returns the catalog of permissions and their levels for a scope, so the FE
// can render role-management dropdowns from a single queryable source.
export const listPermissionCatalog = async (
  props: SelectPermissionCatalogProps,
) => {
  try {
    ListPermissionCatalogSchema.parse(props);

    const permissions = await selectPermissionCatalog(props);

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Permission catalog fetched",
      permissions,
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
      error = ["There was an error fetching the permission catalog"],
    } = caught;

    throw { status, error };
  }
};
