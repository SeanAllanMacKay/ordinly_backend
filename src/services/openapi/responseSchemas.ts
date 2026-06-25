import { fileURLToPath } from "url";
import { dirname, join } from "path";

import * as TJS from "typescript-json-schema";

import { RESPONSE_TYPE_MAP } from "./responseTypes.js";

const here = dirname(fileURLToPath(import.meta.url));
// TJS reads TypeScript source; under tsx the on-disk file is the `.ts`.
const RESPONSE_TYPES_FILE = join(here, "responseTypes.ts");

const SETTINGS: TJS.PartialArgs = {
  required: true,
  // Inline nested types. Drizzle's hydrated relations are anonymous inferred
  // intersections with no named alias; with `ref: true` TJS would emit them as
  // `$ref`s named by their URL-encoded structure. Inlining keeps each response
  // schema self-contained and readable in swagger-ui.
  ref: false,
  ignoreErrors: true, // keep generating past unrelated type errors
  noExtraProps: false,
};

// Mirror the project's tsconfig so module resolution + nullability match.
const COMPILER_OPTIONS: TJS.CompilerOptions = {
  strict: true,
  module: "nodenext",
  moduleResolution: "nodenext",
  target: "es2016",
  esModuleInterop: true,
  skipLibCheck: true,
};

/** Rewrite TJS's `#/definitions/X` refs to OpenAPI's `#/components/schemas/X`. */
const rewriteRefs = (node: any): any => {
  if (Array.isArray(node)) return node.map(rewriteRefs);
  if (node && typeof node === "object") {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] =
        key === "$ref" && typeof value === "string"
          ? value.replace("#/definitions/", "#/components/schemas/")
          : rewriteRefs(value);
    }
    return out;
  }
  return node;
};

export type ResponseSchemas = {
  /** route key (`${METHOD} ${openApiPath}`) → success body `$ref` + optional status override. */
  byRoute: Map<string, { ref: string; status?: number }>;
  /** schemas to merge into `components.schemas`. */
  components: Record<string, any>;
};

/**
 * Build OpenAPI success-body schemas from the action return types declared in
 * `responseTypes.ts`, via the TS type-checker. Best-effort: any failure logs and
 * returns empty so the spec degrades to the generic `200: OK` fallback.
 */
export const buildResponseSchemas = (): ResponseSchemas => {
  const empty: ResponseSchemas = { byRoute: new Map(), components: {} };

  try {
    const program = TJS.getProgramFromFiles(
      [RESPONSE_TYPES_FILE],
      COMPILER_OPTIONS,
    );
    const generator = TJS.buildGenerator(program, SETTINGS);

    if (!generator) {
      console.warn("[openapi] response-schema generator unavailable");
      return empty;
    }

    const typeNames = [
      ...new Set(Object.values(RESPONSE_TYPE_MAP).map((entry) => entry.type)),
    ];

    // Generate each symbol independently so one unrepresentable type (e.g. a
    // property the checker resolves to `never`) only drops itself rather than
    // aborting the whole batch.
    const components: Record<string, any> = {};
    for (const name of typeNames) {
      try {
        const schema = generator.getSchemaForSymbol(name);
        delete (schema as any).$schema;
        components[name] = rewriteRefs(schema);
      } catch (caught) {
        console.warn(
          `[openapi] skipped response schema "${name}":`,
          (caught as Error)?.message ?? caught,
        );
      }
    }

    const byRoute = new Map<string, { ref: string; status?: number }>();
    for (const [route, entry] of Object.entries(RESPONSE_TYPE_MAP)) {
      if (components[entry.type]) {
        byRoute.set(route, {
          ref: `#/components/schemas/${entry.type}`,
          status: entry.status,
        });
      }
    }

    return { byRoute, components };
  } catch (caught) {
    console.warn("[openapi] failed to build response schemas:", caught);
    return empty;
  }
};
