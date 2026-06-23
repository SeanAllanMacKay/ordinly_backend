import multer from "multer";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_NUMBER_OF_FILES,
} from "./constants.js";
import { fileTypeFromBuffer } from "file-type";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const singleFileHandler = ({
  fieldName = "file",
  uploadType = "document",
}: {
  fieldName?: string;
  uploadType?: "document" | "image";
}): RequestHandler => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: uploadType === "document" ? MAX_FILE_SIZE : MAX_IMAGE_SIZE,
    },
  }).single(fieldName);

  return async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        next();
      } else {
        const type = await fileTypeFromBuffer(req.file.buffer);

        if (
          !type ||
          !(
            uploadType === "document"
              ? ACCEPTED_FILE_TYPES
              : ACCEPTED_IMAGE_TYPES
          ).includes(type.mime)
        ) {
          return res.status(400).json({ error: "Invalid file content" });
        }

        if (fieldName) {
          (req as any)[fieldName] = req.file;
        }

        next();
      }
    });
  };
};

export const multiFileHandler = ({
  fieldName = "files",
  uploadType = "document",
  maxFiles = MAX_NUMBER_OF_FILES,
}: {
  fieldName?: string;
  uploadType?: "document" | "image";
  maxFiles?: number;
}): RequestHandler => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: uploadType === "document" ? MAX_FILE_SIZE : MAX_IMAGE_SIZE,
      files: maxFiles,
    },
  }).array(fieldName, maxFiles);

  return async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          console.error("Multer Error Field:", err.field);
          return res.status(400).json({
            error: `Multer Error: ${err.message}`,
            rejectedField: err.field,
          });
        }
        return res.status(400).json({ error: err.message });
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return next();
      }

      try {
        const acceptedMimes =
          uploadType === "document"
            ? ACCEPTED_FILE_TYPES
            : ACCEPTED_IMAGE_TYPES;

        for (const file of files) {
          const type = await fileTypeFromBuffer(file.buffer);

          if (!type || !acceptedMimes.includes(type.mime)) {
            return res.status(400).json({
              error: `Invalid file content: ${file.originalname}`,
            });
          }
        }

        // Attach files to req[fieldName] for consistency with your single handler
        if (fieldName) {
          (req as any)[fieldName] = files;
        }

        next();
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Internal file processing error" });
      }
    });
  };
};
