import B2 from "backblaze-b2";

export default new B2({
  applicationKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
  applicationKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
});

export * from "./constants.js";
export * from "./uploadSingle.js";
export * from "./uploadMultiple.js";
export * from "./fileMiddleware.js";
export * from "./getDownloadURI.js";
