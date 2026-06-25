import { eq } from "drizzle-orm";

import { db, User } from "../../index.js";

/**
 * Fetch the full user row by id WITHOUT the soft-delete filter that
 * `selectUserById` applies. Used by the hard-delete job (which must read the
 * soft-deleted row to decide whether to proceed) and by the delete-account
 * action (which verifies the password before deleting).
 */
export const selectUserRawById = async ({ userId }: { userId: string }) => {
  return db.query.User.findFirst({
    where: eq(User.id, userId),
  });
};
