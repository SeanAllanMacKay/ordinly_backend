import fileStorage from "./index.js";
import { getFileName } from "./util.js";

const userPaths = ["profile-picture"];
const companyPaths = ["logo", "document"];

export const uploadSingle = async ({
  file,
  path = "document",
  companyId,
  userId,
}: {
  file: Express.Multer.File;
} & (
  | {
      path: (typeof companyPaths)[number];
      companyId: string;
      userId?: undefined;
    }
  | { path: (typeof userPaths)[number]; companyId?: undefined; userId: string }
)) => {
  await fileStorage.authorize();

  const {
    data: { uploadUrl, authorizationToken },
  } = await fileStorage.getUploadUrl({
    bucketId: process.env.BUCKET_ID!,
  });

  const fileName = getFileName({ path, companyId, userId, file });

  const response = await fileStorage.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName: fileName,
    data: file.buffer,
  });

  const publicUrl = `/file/${process.env.BUCKET_NAME!}/${fileName}`;

  return {
    fileId: response.data.fileId,
    url: publicUrl,
    fileName: fileName,
  };
};
