import { HTTP_STATUSES } from "../HTTP_STATUSES.js";
import {
  selectProjectTask,
  selectProjectTaskDocument,
  SelectProjectTaskDocumentProps,
} from "../../services/db/index.js";
import * as z from "zod";
import { fileService } from "../../services/files/index.js";

const GetProjectTaskSchema = z.object({
  userId: z.string("Invalid userId"),
  projectId: z.string("Invalid projectId"),
  taskId: z.string("Invalid taskId"),
  documentId: z.string("Invalid documentId"),
});

export const getProjectTaskDocument = async (
  getProjectTaskDocumentProps: SelectProjectTaskDocumentProps,
) => {
  try {
    GetProjectTaskSchema.parse(getProjectTaskDocumentProps);

    const document = await selectProjectTaskDocument(
      getProjectTaskDocumentProps,
    );

    if (!document) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.NOT_FOUND,
        error: ["Document not found"],
      };
    }

    const downloadURL = await fileService.getDownloadLink({ document });

    return {
      status: HTTP_STATUSES.SUCCESS.OK,
      message: "Task fetched",
      document: {
        ...document,
        downloadURL,
      },
    };
  } catch (caught: any) {
    if (caught instanceof z.ZodError) {
      throw {
        status: HTTP_STATUSES.CLIENT_ERROR.BAD_REQUEST,
        error: caught.issues.map(({ message }) => message),
      };
    }

    const {
      status = HTTP_STATUSES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      error = ["There was an error fetching this document"],
    } = caught;

    throw {
      status: status,
      error: error,
    };
  }
};
