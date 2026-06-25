import { inArray } from "drizzle-orm";

import { db, User } from "../../index.js";

// Resolves recipient user ids to the address info the dispatch channels need
// (email now; a push-token join can be added here later).
export const selectUsersByIds = async ({ userIds }: { userIds: string[] }) => {
  if (!userIds.length) return [];

  return db.query.User.findMany({
    where: inArray(User.id, userIds),
    columns: { id: true, name: true, email: true },
  });
};
