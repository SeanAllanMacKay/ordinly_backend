import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: "s3.us-east-005.backblazeb2.com",
  region: "us-east-005",
});
