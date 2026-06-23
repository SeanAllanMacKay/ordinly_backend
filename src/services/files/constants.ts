export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const MAX_NUMBER_OF_FILES = 10;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/svg+xml",
  "image/x-dwg",
  "image/png",
  "image/gif",
  // Some svg are stored as xml
  "application/xml",
];

export const ACCEPTED_CAD_TYPES = [
  "application/acad",
  "application/autocad_dwg",
  "application/ifc",
  "application/step",
  "application/dxf",
  "application/octet-stream",
];

export const ACCEPTED_MS_TYPES = [
  "application/vnd.ms-project",
  "application/mpp",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ACCEPTED_DATA_TYPES = [
  "text/csv",
  "application/pdf",
  "application/xml",
];

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/aac",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/opus",
  "audio/flac",
];

export const ACCEPTED_COMPRESSED_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
];

export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_MS_TYPES,
  ...ACCEPTED_CAD_TYPES,
  ...ACCEPTED_DATA_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_AUDIO_TYPES,
  ...ACCEPTED_COMPRESSED_TYPES,
];
