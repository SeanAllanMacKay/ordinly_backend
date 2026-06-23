import { createProxyMiddleware } from "http-proxy-middleware";

const MAP_API_TOKEN = process.env.MAP_API_TOKEN!;

export const MAPS_PATH = "/maps";

export const mapsMiddleware = createProxyMiddleware({
  target: "https://api.mapbox.com",
  changeOrigin: true,
  pathRewrite: async (path, req) => {
    const url = new URL(path, "https://api.mapbox.com");
    url.searchParams.set("access_token", MAP_API_TOKEN);
    return url.pathname + url.search;
  },
  on: {
    proxyRes: (proxyRes, req, res) => {
      const origin = req.headers.origin;

      delete proxyRes.headers["etag"];
      delete proxyRes.headers["access-control-allow-origin"];

      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
      res.setHeader("Cache-Control", "no-cache");
    },
    error: (err, req, res) => {
      console.error("Map proxy Error:", err);
    },
  },
});
