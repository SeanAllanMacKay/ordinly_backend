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

export type UploadPublicImageVariantsArgs = UploadArgs & {
  prefix: string;
  sizes: readonly number[];
  // "cover" -> square crop (avatars); "inside" -> width-bounded (logos)
  fit: "cover" | "inside";
};

// Result of a variant upload. `path` is the base key (no size suffix); the
// per-size objects live at `${path}-<size>.webp`. Shape mirrors #uploadSingle so
// existing DB-insert callers (e.g. insertCompany) keep working unchanged.
export type UploadedImageVariants = {
  fileId: string;
  fileName: string;
  path: string;
  isPublic: true;
};

export type UploadMultipleArgs = {
  files: (UploadArgs & {
    fileName: string;
  })[];
};

export type UploadCompanyLogoArgs = UploadArgs & {
  companyId: string;
};

export type UploadUserProfilePictureArgs = UploadArgs & {
  userId: string;
};

export type UploadTeamProfilePictureArgs = UploadArgs & {
  teamId: string;
};

export type UploadClientProfilePictureArgs = UploadArgs & {
  clientId: string;
};

export type UploadContactProfilePictureArgs = UploadArgs & {
  contactId: string;
};

export type UploadTaskDocumentsArgs = MultiUploadArgs & {
  taskId: string;
};

export type AppendableObject = {
  externalPath: string;
  isPublic: boolean;
} & Record<string, unknown>;
