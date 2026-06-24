import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type ChangedPasswordProps = {
  referer?: string;
};

export default ({ referer }: ChangedPasswordProps = {}) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = "Your password was changed";

  return {
    subject: "Your Ordinly password was changed",
    html: wrapHtml({
      preheader: "If this wasn't you, secure your account right away.",
      heading,
      bodyHtml:
        paragraph(
          "The password for the Ordinly account linked to this email was just changed.",
        ) +
        paragraph("If you made this change, you're all set — no action is needed."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
      footnote:
        "If you did <strong>not</strong> change your password, contact our support team immediately so we can help secure your account.",
    }),
    text: wrapText({
      heading,
      lines: [
        "The password for the Ordinly account linked to this email was just changed.",
        "If you made this change, you're all set — no action is needed.",
        "If you did NOT change your password, contact our support team immediately so we can help secure your account.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
