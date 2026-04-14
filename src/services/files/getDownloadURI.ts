import fileStorage from "./index.js";

export const getDownloadURI = async ({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) => {
  const auth = await fileStorage.authorize();

  const {
    data: { authorizationToken },
  } = await fileStorage.getDownloadAuthorization({
    bucketId: process.env.BUCKET_ID!,
    fileNamePrefix: fileName,
    validDurationInSeconds: 3600 / 4, // Valid for 15 mins
  });

  return `${auth.data.downloadUrl}/file/${bucketName}/${fileName}?Authorization=${authorizationToken}`;
};
