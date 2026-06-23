import type { Express } from "express";

import { listEndpoints, DiscoveredEndpoint } from "./listEndpoints.js";
import { getRouteSchemas, RegisteredRoute } from "./registry.js";
import { schemaToJsonSchema } from "./schemaToOpenApi.js";

const API_PORT = process.env.API_PORT;

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

const toOpenApiPath = (path: string) =>
  path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");

const pathParamNames = (openApiPath: string) =>
  [...openApiPath.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]);

/**
 * Build a dev-only OpenAPI 3.0 document by auto-discovering routes from the
 * mounted Express app and enriching them with request bodies / query params
 * from action Zod schemas annotated via `.meta({ route })`.
 *
 * Best-effort: any failure (listing endpoints, a single schema conversion) is
 * logged and skipped so the spec degrades to a partial result rather than
 * crashing dev startup.
 */
export const buildOpenApiSpec = (app: Express) => {
  let routeSchemas = new Map<string, RegisteredRoute>();
  try {
    routeSchemas = getRouteSchemas();
  } catch (caught) {
    console.warn("[openapi] failed to read schema registry:", caught);
  }

  let endpoints: DiscoveredEndpoint[] = [];
  try {
    endpoints = listEndpoints(app);
  } catch (caught) {
    console.warn("[openapi] failed to list endpoints:", caught);
  }

  const paths: Record<string, any> = {};

  for (const endpoint of endpoints) {
    const openApiPath = toOpenApiPath(endpoint.path);
    const params = pathParamNames(openApiPath);
    const secured = endpoint.middlewares.includes("verifyToken");
    const pathItem = paths[openApiPath] ?? (paths[openApiPath] = {});

    for (const rawMethod of endpoint.methods) {
      const method = rawMethod.toLowerCase();
      if (!HTTP_METHODS.includes(method)) continue;

      const operation: any = {
        tags: [openApiPath.split("/")[2] || "root"],
        operationId: `${method}_${openApiPath}`.replace(/[^A-Za-z0-9_]/g, "_"),
        parameters: params.map((name) => ({
          name,
          in: "path",
          required: true,
          schema: { type: "string" },
        })),
        responses: {
          ...(method === "post" ? { "201": { description: "Created" } } : {}),
          "200": { description: "OK" },
          "400": {
            description: "Bad request",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          ...(secured ? { "401": { description: "Unauthorized" } } : {}),
        },
      };

      if (secured) operation.security = [{ cookieAuth: [] }];

      const registered = routeSchemas.get(`${rawMethod} ${openApiPath}`);
      if (registered) {
        try {
          const jsonSchema = schemaToJsonSchema(registered.schema);

          if (method === "get") {
            const props = jsonSchema.properties ?? {};
            const required = jsonSchema.required ?? [];
            operation.parameters.push(
              ...Object.entries(props).map(([name, schema]) => ({
                name,
                in: "query",
                required: required.includes(name),
                schema,
              })),
            );
          } else if (registered.meta.multipart?.file) {
            const props = { ...(jsonSchema.properties ?? {}) };
            props[registered.meta.multipart.file] = {
              type: "string",
              format: "binary",
            };
            operation.requestBody = {
              content: {
                "multipart/form-data": {
                  schema: { ...jsonSchema, properties: props },
                },
              },
            };
          } else {
            operation.requestBody = {
              required: true,
              content: { "application/json": { schema: jsonSchema } },
            };
          }
        } catch (caught) {
          console.warn(
            `[openapi] schema conversion failed for ${rawMethod} ${openApiPath}:`,
            caught,
          );
        }
      }

      pathItem[method] = operation;
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Ordinly API",
      version: "dev",
      description:
        "Auto-generated dev reference. Routes are auto-discovered from the live Express app; request bodies/query params come from action Zod schemas annotated with `.meta({ route })`. Unannotated routes show path/method/params/auth only.",
    },
    servers: [{ url: `http://localhost:${API_PORT}` }],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "auth" },
      },
    },
    paths,
  };
};
