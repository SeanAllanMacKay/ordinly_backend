import { Router } from "express";
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_NUMBER_OF_FILES,
} from "../services/files/index.js";
import { HTTP_STATUSES } from "../actions/index.js";

const router = Router({ mergeParams: true });

router.route("/file").get(async (_req, res) => {
  try {
    res.status(200).send({
      message: "Fetched file metadata",
      maxFileSize: MAX_FILE_SIZE,
      acceptedFileTypes: ACCEPTED_FILE_TYPES,
      maxFiles: MAX_NUMBER_OF_FILES,
    });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the file metadata",
    } = caught;

    res.status(status).send({ error });
  }
});

router.route("/image").get(async (_req, res) => {
  try {
    res.status(200).send({
      message: "Fetched image metadata",
      maxFileSize: MAX_IMAGE_SIZE,
      acceptedFileTypes: ACCEPTED_IMAGE_TYPES,
      maxFiles: MAX_NUMBER_OF_FILES,
    });
  } catch (caught: any) {
    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = "There was an error fetching the image metadata",
    } = caught;

    res.status(status).send({ error });
  }
});

export default router;
