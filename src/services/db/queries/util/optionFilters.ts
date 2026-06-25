import { ilike, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * Safety cap on un-paginated `/options` lists (FE selects). High enough for any
 * realistic dropdown, low enough to protect against runaway collections.
 */
export const OPTIONS_LIMIT = 100;

/**
 * Optional case-insensitive substring match on an option's label column, for
 * typeahead. Returns undefined when no (non-blank) search term is given so it
 * drops cleanly out of an `and(...)`.
 */
export const optionSearch = (
  column: AnyPgColumn,
  search?: string,
): SQL | undefined =>
  search?.trim() ? ilike(column, `%${search.trim()}%`) : undefined;
