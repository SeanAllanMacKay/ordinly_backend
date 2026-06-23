export type StorageConfig = {
  keyId: string;
  applicationKey: string;
  publicBucketId: string;
  publicBucketName: string;
  privateBucketId: string;
  privateBucketName: string;
};

export type ConstructFilePathArgs = {
  prefix: string;
  file: Express.Multer.File;
};

export type GetUploadURLArgs = { bucketId: string };

export type UploadArgs = {
  file: Express.Multer.File;
};

export type MultiUploadArgs = {
  files: Express.Multer.File[];
};

export type UploadSingleArgs = UploadArgs &
  GetUploadURLArgs & {
    path: string;
    isPublic: boolean;
  };

export type UploadSingleToPublicArgs = ConstructFilePathArgs & UploadArgs;

export type UploadMultipleArgs = {
  files: (UploadArgs & {
    fileName: string;
  })[];
};

export type UploadCompanyLogoArgs = UploadArgs & {
  companyId: string;
};

export type GetCompanyLogoURLArgs = {
  path: string;
};

export type UploadUserProfilePictureArgs = UploadArgs & {
  userId: string;
};

export type UploadTaskDocumentsArgs = MultiUploadArgs & {
  taskId: string;
};

export type AppendableObject = {
  externalPath: string;
  isPublic: boolean;
} & Record<string, unknown>;
