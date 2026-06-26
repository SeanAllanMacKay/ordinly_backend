import B2 from "backblaze-b2";
import crypto from "crypto";
import {
  AppendableObject,
  ConstructFilePathArgs,
  GetUploadURLArgs,
  StorageConfig,
  UploadCompanyLogoArgs,
  UploadedImageVariants,
  UploadPublicImageVariantsArgs,
  UploadSingleArgs,
  UploadTaskDocumentsArgs,
  UploadUserProfilePictureArgs,
} from "./types.js";
import { fileServicePrefixes } from "./util.js";
import { buildImageVariants } from "./imageVariants.js";
import { COMPANY_LOGO_SIZES, PROFILE_PICTURE_SIZES } from "./constants.js";

class StorageService {
  // The connection to the file service
  private connection: B2;

  // The authorization information for the connection to the file service
  private authorization: Awaited<ReturnType<B2["authorize"]>>["data"] & {
    expiry: number;
  } = null;

  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    this.connection = new B2({
      applicationKeyId: config.keyId,
      applicationKey: config.applicationKey,
    });
  }

  /**
   * Ensures the connection to the file service is authorized
   *
   * @returns the cached authorization object
   */
  async #authorize() {
    const BUFFER_MS = 5 * 60 * 1000;
    const now = Date.now() - BUFFER_MS;

    if (!this.authorization || now > this.authorization.expiry) {
      const res = await this.connection.authorize();

      this.authorization = { ...res.data, expiry: now + 24 * 60 * 60 * 1000 };
    }

    return this.authorization;
  }

  /**
   * Constructs a date string to be used in a file path
   *
   * @returns the date string
   */
  #getDateString() {
    return new Date().toISOString().split("T")[0].replace(/-/g, "/");
  }

  /**
   * Constructs a hash string to be used in a file path
   *
   * @returns the hash string
   */
  #getHashString() {
    return crypto.randomBytes(8).toString("hex");
  }

  /**
   * Constructs a file path string to be used for uploads
   *
   * @param prefix - The path in the bucket to the file
   * @param file - The file
   *
   * @returns the file path string
   */
  #createFilePath({ prefix, file }: ConstructFilePathArgs) {
    const dateString = this.#getDateString();
    const hashString = this.#getHashString();
    const safeName = file.originalname
      .replace(/[^a-z0-9.]/gi, "_")
      .toLowerCase();

    return `${prefix}/${dateString}/${hashString}-${safeName}`;
  }

  /**
   * Constructs a base key (no extension/size suffix) for a set of image
   * variants. Each variant is stored at `${base}-<size>.webp`.
   *
   * @param prefix - The path in the bucket to the file
   *
   * @returns the base key string
   */
  #createBasePath({ prefix }: { prefix: string }) {
    return `${prefix}/${this.#getDateString()}/${this.#getHashString()}`;
  }

  #getDownloadContentDisposition({ fileName }: { fileName: string }) {
    return `attachment; filename="${fileName}"`;
  }

  /**
   * Gets a download url and necessary authorization token
   *
   * @param prefix - The path in the bucket to allow downloads from
   *
   * @returns the upload url and necessary authorization token
   */
  async #getDownloadURL({
    prefix = "",
    fileName,
  }: {
    prefix?: string;
    fileName: string;
  }) {
    const { downloadUrl } = await this.#authorize();

    const {
      data: { authorizationToken },
    } = await this.connection.getDownloadAuthorization({
      bucketId: process.env.PRIVATE_BUCKET_ID!,
      fileNamePrefix: prefix,
      validDurationInSeconds: 3600,
      b2ContentDisposition: this.#getDownloadContentDisposition({ fileName }),
    });

    return { downloadUrl, authorizationToken };
  }

  /**
   * Gets a preview url and necessary authorization token
   *
   * @param prefix - The path in the bucket to allow downloads from
   *
   * @returns the upload url and necessary authorization token
   */
  async #getPreviewURL({ prefix = "" }: { prefix?: string }) {
    const { downloadUrl } = await this.#authorize();

    const {
      data: { authorizationToken },
    } = await this.connection.getDownloadAuthorization({
      bucketId: process.env.PRIVATE_BUCKET_ID!,
      fileNamePrefix: prefix,
      validDurationInSeconds: 3600,
    });

    return { downloadUrl, authorizationToken };
  }

  async getExternalURL({
    externalPath,
    isPublic = false,
  }: {
    externalPath: string;
    isPublic: boolean;
  }) {
    const { downloadUrl, authorizationToken } = await this.#getPreviewURL({
      prefix: externalPath,
    });

    return {
      externalURL: `${downloadUrl}/file/${isPublic ? this.config.publicBucketName : this.config.privateBucketName}/${externalPath}?Authorization=${authorizationToken}`,
    };
  }

  async appendExternalURLToObject({
    document,
  }: {
    document: AppendableObject;
  }) {
    return {
      ...document,
      externalURL: this.getExternalURL(document),
    };
  }

  async appendExternalURLsToObjectsInArray({
    documents,
  }: {
    documents: AppendableObject[];
  }) {
    const prefixGroups = new Map<string, AppendableObject[]>();

    documents.forEach(({ externalPath, ...restDocument }) => {
      if (!externalPath) {
        return;
      }

      // Remove the date string and filename
      const directoryPrefix = externalPath.split(/^\d{4}\/\d{2}\/\d{2}$/)[0];

      if (!prefixGroups.has(directoryPrefix)) {
        prefixGroups.set(directoryPrefix, []);
      }

      prefixGroups
        .get(directoryPrefix)!
        .push({ ...restDocument, externalPath });
    });

    const linkPromises = Array.from(prefixGroups.entries()).map(
      async ([prefix, files]) => {
        const { downloadUrl, authorizationToken } = await this.#getPreviewURL({
          prefix,
        });

        return files.map((file) => ({
          ...file,
          externalURL: `${downloadUrl}/file/${file.isPublic ? this.config.publicBucketName : this.config.privateBucketName}/${file.externalPath}?Authorization=${authorizationToken}`,
        }));
      },
    );

    return (await Promise.all(linkPromises)).flat();
  }

  async getDownloadLink({
    document,
  }: {
    document: AppendableObject & { name: string };
  }) {
    const { downloadUrl, authorizationToken } = await this.#getDownloadURL({
      prefix: document.externalPath,
      fileName: document.name,
    });

    return (
      `${downloadUrl}/file/${this.config.privateBucketName}/${document.externalPath}` +
      `?Authorization=${authorizationToken}` +
      `&b2ContentDisposition=${encodeURIComponent(this.#getDownloadContentDisposition({ fileName: document.name }))}`
    );
  }

  /**
   * Gets an upload URL and necessary authorization token
   *
   * @returns the upload url and necessary authorization token
   */
  async #getUploadURL({ bucketId }: GetUploadURLArgs) {
    const {
      data: { uploadUrl, authorizationToken },
    } = await this.connection.getUploadUrl({
      bucketId,
    });

    return { uploadUrl, authorizationToken };
  }

  /**
   * Uploads a single file to out file service
   *
   * @param bucketId - The bucket to upload to
   * @param bucketName - The name of the bucket being uploaded to
   * @param file - The file to upload
   * @param path - The path & file name to store the file at in the bucket
   *
   * @returns The information necessary to store a link to the uploaded file in the DB
   */
  async #uploadSingle({ bucketId, file, path, isPublic }: UploadSingleArgs) {
    await this.#authorize();

    const { uploadUrl, authorizationToken } = await this.#getUploadURL({
      bucketId,
    });

    const response = await this.connection.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: path,
      data: file.buffer,
    });

    return {
      fileId: response.data.fileId,
      fileName: file.originalname,
      path: path,
      isPublic,
    };
  }

  /**
   * Uploads a raw buffer to a specific bucket at an exact path. Unlike
   * #uploadSingle this isn't tied to a Multer file, so it can store the
   * derived WebP variant buffers.
   *
   * @returns the B2 fileId of the stored object
   */
  async #uploadBuffer({
    bucketId,
    path,
    buffer,
  }: {
    bucketId: string;
    path: string;
    buffer: Buffer;
  }) {
    await this.#authorize();

    const { uploadUrl, authorizationToken } = await this.#getUploadURL({
      bucketId,
    });

    const response = await this.connection.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: path,
      data: buffer,
    });

    return response.data.fileId as string;
  }

  /**
   * Resizes an image into WebP variants and uploads them to the public bucket
   * under one shared base key (`${base}-<size>.webp`). Used for both avatars
   * (square crop) and company logos (aspect-preserving width caps).
   *
   * @returns DB-ready info: `path` is the base key, `fileId` the id of one
   *          stored variant. Shape matches #uploadSingle so existing inserters
   *          (e.g. insertCompany) keep working.
   */
  async #uploadPublicImageVariants({
    prefix,
    file,
    sizes,
    fit,
  }: UploadPublicImageVariantsArgs): Promise<UploadedImageVariants> {
    const basePath = this.#createBasePath({ prefix });

    const variants = await buildImageVariants({
      buffer: file.buffer,
      sizes,
      fit,
    });

    const uploaded = await Promise.all(
      variants.map(({ size, buffer }) =>
        this.#uploadBuffer({
          bucketId: this.config.publicBucketId,
          path: `${basePath}-${size}.webp`,
          buffer,
        }),
      ),
    );

    return {
      fileId: uploaded[0],
      fileName: file.originalname,
      path: basePath,
      isPublic: true,
    };
  }

  /**
   * Uploads multiple files to a specific bucket
   *
   * @param bucketId - The bucket to upload to
   * @param bucketName - The name of the bucket
   * @param prefix - The path prefix for the files
   * @param files - Array of files to upload
   *
   * @returns Array of file information for the DB
   */
  async #uploadMulti({
    bucketId,
    prefix,
    files,
  }: {
    bucketId: string;
    prefix: string;
    files: Express.Multer.File[];
  }) {
    return Promise.all(
      files.map((file) => {
        const path = this.#createFilePath({ prefix, file });

        return this.#uploadSingle({
          bucketId,
          file,
          path,
          isPublic: false,
        });
      }),
    );
  }

  /**
   * Uploads a company logo as WebP variants (aspect ratio preserved).
   *
   * @param companyId - The id of the company
   * @param file - The logo to upload
   *
   * @returns The information necessary to store a link to the uploaded logo in the DB
   */
  async uploadCompanyLogo({ companyId, file }: UploadCompanyLogoArgs) {
    return this.#uploadPublicImageVariants({
      prefix: fileServicePrefixes.companyLogo({ companyId }),
      file,
      sizes: COMPANY_LOGO_SIZES,
      fit: "inside",
    });
  }

  /**
   * Uploads a user's profile picture as square WebP variants.
   *
   * @param userId - The id of the user
   * @param file - The profile picture to upload
   *
   * @returns The information necessary to store a link to the uploaded profile picture in the DB
   */
  async uploadUserProfilePicture({
    userId,
    file,
  }: UploadUserProfilePictureArgs) {
    return this.#uploadPublicImageVariants({
      prefix: fileServicePrefixes.userProfilePicture({ userId }),
      file,
      sizes: PROFILE_PICTURE_SIZES,
      fit: "cover",
    });
  }

  /**
   * Builds the public, CDN-cacheable URL for an object in the public bucket.
   * Native B2 public files are served at /file/<bucketName>/<path>.
   */
  buildPublicURL(path: string) {
    const downloadUrl =
      process.env.PUBLIC_ASSET_BASE_URL ?? this.authorization?.downloadUrl;

    return `${downloadUrl}/file/${this.config.publicBucketName}/${path}`;
  }

  /**
   * Builds a `{ size: url }` map of public variant URLs for one base key.
   * Pure string concat after a single authorize — no per-size signing — so a
   * screen with many images pays no per-request token cost.
   *
   * @param basePath - The base key stored on the Document (no size suffix)
   * @param sizes - The variant sizes that were generated at upload
   */
  async buildImageVariantURLs(basePath: string, sizes: readonly number[]) {
    await this.#authorize();

    return Object.fromEntries(
      sizes.map((size) => [
        size,
        this.buildPublicURL(`${basePath}-${size}.webp`),
      ]),
    ) as Record<number, string>;
  }

  /**
   * Convenience: profile-picture variant URL map for a Document base path, or
   * null when the user has no avatar.
   */
  async buildProfilePictureURLs(basePath: string | null | undefined) {
    if (!basePath) return null;

    return this.buildImageVariantURLs(basePath, PROFILE_PICTURE_SIZES);
  }

  /**
   * Convenience: company-logo variant URL map for a Document base path, or null
   * when the company has no logo.
   */
  async buildCompanyLogoURLs(basePath: string | null | undefined) {
    if (!basePath) return null;

    return this.buildImageVariantURLs(basePath, COMPANY_LOGO_SIZES);
  }

  /**
   * Deletes every stored object (all size variants) under a base key. Used when
   * an avatar or logo is replaced or removed. Best-effort by caller.
   *
   * @param basePath - The base key whose variants should be removed
   */
  async deletePublicImage(basePath: string) {
    await this.#authorize();

    const {
      data: { files },
    } = await this.connection.listFileNames({
      bucketId: this.config.publicBucketId,
      prefix: basePath,
      maxFileCount: 100,
      startFileName: "",
      delimiter: "",
    });

    await Promise.all(
      files.map((file: { fileId: string; fileName: string }) =>
        this.connection.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        }),
      ),
    );
  }

  /**
   * Uploads multiple task documents to the private bucket
   *
   * @param userId - The id of the user uploading the files
   * @param files - The documents to upload
   *
   * @returns The information for all uploaded documents
   */
  async uploadTaskDocuments({ taskId, files }: UploadTaskDocumentsArgs) {
    return this.#uploadMulti({
      bucketId: this.config.privateBucketId,
      prefix: fileServicePrefixes.taskDocument({ taskId }),
      files,
    });
  }
}

export const fileService = new StorageService({
  keyId: process.env.BUCKET_ACCESS_KEY_ID!,
  applicationKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
  publicBucketId: process.env.PUBLIC_BUCKET_ID!,
  publicBucketName: process.env.PUBLIC_BUCKET_NAME!,
  privateBucketId: process.env.PRIVATE_BUCKET_ID!,
  privateBucketName: process.env.PRIVATE_BUCKET_NAME!,
});

export * from "./constants.js";
export * from "./fileMiddleware.js";
