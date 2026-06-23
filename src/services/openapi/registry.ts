import * as z from "zod";

// Side-effect import: loading the action barrel runs every `.meta({...})` call
// so the schemas register themselves in Zod's global registry. (Routers import
// actions at startup too, so this is mostly insurance.)
import "../../actions/index.js";

export type RouteMeta = {
  /** Required for enumeration — only schemas with an `id` land in `_idmap`. */
  id: string;
  /** OpenAPI-style key, e.g. "POST /api/company/{companyId}/projects". */
  route: string;
  /** Present for multipart/form-data routes; names the injected file field. */
  multipart?: { file: string };
};

export type RegisteredRoute = {
  schema: z.ZodObject<any>;
  meta: RouteMeta;
};

/**
 * Index every schema annotated with a `route` (via `.meta`) by its route key.
 * Reads Zod's global registry `_idmap` (a plain Map of id → schema); only
 * schemas given an `id` in their meta appear there.
 */
export const getRouteSchemas = (): Map<string, RegisteredRoute> => {
  const map = new Map<string, RegisteredRoute>();

  const idmap = (z.globalRegistry as any)._idmap as Map<string, z.ZodObject<any>>;

  for (const [, schema] of idmap) {
    const meta = z.globalRegistry.get(schema) as RouteMeta | undefined;

    if (meta?.route) {
      map.set(meta.route, { schema, meta });
    }
  }

  return map;
};
