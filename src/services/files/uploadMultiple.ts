import fileStorage from "./index.js";
import { getFileName } from "./util.js";

export const uploadMultiple = async ({
  files,
  companyId,
}: {
  files: Express.Multer.File[];
  companyId: string;
}) => {
  await fileStorage.authorize();

  const uploadPromises = files.map(async (file) => {
    const {
      data: { uploadUrl, authorizationToken },
    } = await fileStorage.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!,
    });

    const fileName = getFileName({ path: "document", companyId, file });

    const response = await fileStorage.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: fileName,
      data: file.buffer,
    });

    const publicUrl = `${process.env.BUCKET_ENDPOINT_URL!}/file/${process.env.BUCKET_NAME!}/${fileName}`;

    return {
      fileId: response.data.fileId,
      url: publicUrl,
      fileName: fileName,
      originalName: file.originalname,
    };
  });

  return await Promise.all(uploadPromises);
};
