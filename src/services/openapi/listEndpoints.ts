import type { Express } from "express";

export type DiscoveredEndpoint = {
  /** Path with params as `{name}` for mounted params and `:name` for leaf params. */
  path: string;
  methods: string[];
  middlewares: string[];
};

/**
 * Reconstruct a mounted sub-router's path prefix from its compiled regexp +
 * keys. Express 4 (path-to-regexp@0.1.x) emits sources like:
 *   static mount:  `^\/company\/?(?=\/|$)`
 *   param  mount:  `^(?:\/([^/]+?))\/?(?=\/|$)`  (keys: ["companyId"])
 * `express-list-endpoints` fails to recover the param mounts, so we parse here.
 */
const parseMountPath = (layer: any): string => {
  if (!layer.regexp) return "";
  if (layer.regexp.fast_slash) return "";

  let keyIdx = 0;
  let src: string = layer.regexp.source.replace(
    /\(\?:\\\/\(\[\^\/\]\+\?\)\)/g,
    () => {
      const key = layer.keys?.[keyIdx++];
      return key ? `/{${key.name}}` : "/{param}";
    },
  );

  src = src
    .replace(/^\^/, "")
    .replace(/\\\/\?\(\?=\\\/\|\$\)$/, "")
    .replace(/\(\?=\\\/\|\$\)$/, "")
    .replace(/\$$/, "");

  return src.replace(/\\\//g, "/");
};

/**
 * Walk the Express app's router stack and return every registered endpoint with
 * its fully-qualified path, HTTP methods, and the names of its route-level
 * middlewares (used to detect `verifyToken`).
 */
export const listEndpoints = (app: Express): DiscoveredEndpoint[] => {
  const endpoints: DiscoveredEndpoint[] = [];

  const walk = (stack: any[], prefix: string) => {
    for (const layer of stack) {
      if (layer.route) {
        let path = (prefix + layer.route.path).replace(/\/{2,}/g, "/");
        if (path.length > 1) path = path.replace(/\/$/, "");

        const methods = Object.keys(layer.route.methods)
          .filter((method) => layer.route.methods[method])
          .map((method) => method.toUpperCase());

        const middlewares = (layer.route.stack ?? []).map(
          (handler: any) => handler.name,
        );

        endpoints.push({ path, methods, middlewares });
      } else if (layer.name === "router" && layer.handle?.stack) {
        walk(layer.handle.stack, prefix + parseMountPath(layer));
      }
    }
  };

  const stack = (app as any)._router?.stack ?? [];
  walk(stack, "");

  return endpoints;
};
