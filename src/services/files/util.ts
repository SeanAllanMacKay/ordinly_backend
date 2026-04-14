import crypto from "crypto";

export const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export const getFileName = ({
  path,
  file,
  userId,
  companyId,
}: {
  path: string;
  file: Express.Multer.File;
  userId?: string;
  companyId?: string;
}) => {
  const fileHash = crypto.randomBytes(8).toString("hex");

  const dateString = getDateString();

  if (userId) {
    return `user/${userId}/${path}/${dateString}/${fileHash}-${file.originalname}`;
  }

  return `company/${companyId}/${path}/${dateString}/${fileHash}-${file.originalname}`;
};
