import * as z from "zod";

/**
 * JSON Schema dialect to emit. `openapi-3.0` produces OpenAPI 3.0 Schema
 * Objects (`nullable`, `example`) which swagger-ui renders reliably. Switch
 * this one constant if the renderer is later swapped for one with solid 3.1
 * support (e.g. Scalar/Redoc).
 */
export const OPENAPI_TARGET = "openapi-3.0" as const;

/**
 * Keys that are injected by middleware/path params rather than sent in the
 * client request body, so they are stripped before conversion. Path params are
 * documented separately as `in: path` parameters.
 */
const INJECTED_KEYS = ["userId", "companyId", "projectId", "taskId"] as const;

// Fresh, empty registry so toJSONSchema never extracts registered schemas as
// `$ref`/`$defs` — we want fully inlined bodies regardless of `.meta({ id })`.
const NO_META = z.registry();

/**
 * Convert an action Zod schema to an inline OpenAPI 3.0 schema object,
 * stripping any path/auth-injected keys that are present on the schema.
 */
export const schemaToJsonSchema = (schema: z.ZodObject<any>) => {
  const shapeKeys = Object.keys(schema.shape);
  const mask = Object.fromEntries(
    INJECTED_KEYS.filter((key) => shapeKeys.includes(key)).map((key) => [
      key,
      true,
    ]),
  );

  const stripped = Object.keys(mask).length
    ? schema.omit(mask as any)
    : schema;

  return z.toJSONSchema(stripped, {
    io: "input",
    unrepresentable: "any",
    target: OPENAPI_TARGET,
    metadata: NO_META,
  }) as { properties?: Record<string, any>; required?: string[] } & Record<
    string,
    any
  >;
};
