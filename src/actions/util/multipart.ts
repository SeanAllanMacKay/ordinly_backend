// When a create request is multipart (a profile picture is attached), every
// non-file field arrives as a string. JSON-decode the structured fields listed
// so the payload validates the same as an application/json request. Values that
// are already non-strings (the JSON path) pass through untouched, and anything
// that fails to parse is left as-is so schema validation surfaces a clear error.
export const coerceJsonFields = <T extends Record<string, any>>(
  props: T,
  fields: readonly string[],
): T => {
  const next: Record<string, any> = { ...props };

  for (const field of fields) {
    if (typeof next[field] === "string") {
      try {
        next[field] = JSON.parse(next[field]);
      } catch {
        // Leave the raw string in place; Zod will report a useful error.
      }
    }
  }

  return next as T;
};
