import { convert } from "html-to-text";

export const htmlToPlaintext = (htmlString?: string) => {
  if (!htmlString) {
    return;
  }
  return convert(htmlString, { wordwrap: false })
    .replace(/[\n\r]+/g, " ")
    .replace(/\s\s+/g, " ")
    .trim();
};
