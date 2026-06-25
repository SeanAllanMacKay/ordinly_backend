import { buildUrl, paragraph, wrapHtml, wrapText, type Cta } from "./layout.js";

type ReminderProps = {
  title: string;
  body?: string;
  referer?: string;
  /** Optional deep link to the thing the reminder is about. */
  cta?: Cta;
};

// Generic template used for user-created reminders, where the subject/body are
// free-form rather than a fixed transactional message.
export default ({ title, body, referer, cta }: ReminderProps) => {
  const resolvedCta = cta ?? { href: buildUrl(referer), label: "Open Ordinly" };
  const lines = body ? [body] : ["You asked Ordinly to remind you about this."];

  return {
    subject: `Reminder: ${title}`,
    html: wrapHtml({
      preheader: body ?? title,
      heading: title,
      bodyHtml: lines.map(paragraph).join(""),
      cta: resolvedCta,
    }),
    text: wrapText({ heading: title, lines, cta: resolvedCta }),
  };
};
