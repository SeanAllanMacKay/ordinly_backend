import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AccountVerifiedProps = {
  referer?: string;
};

export default ({ referer }: AccountVerifiedProps = {}) => {
  const appUrl = buildUrl(referer, "?form=login");
  const heading = "Your account is verified";

  return {
    subject: "Your Ordinly account is verified",
    html: wrapHtml({
      preheader: "You're all set — your email has been confirmed.",
      heading,
      bodyHtml:
        paragraph("Thanks for confirming your email — your account is now fully active.") +
        paragraph("Log in whenever you're ready to start planning."),
      cta: { href: appUrl, label: "Go to Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        "Thanks for confirming your email — your account is now fully active.",
        "Log in whenever you're ready to start planning.",
      ],
      cta: { href: appUrl, label: "Go to Ordinly" },
    }),
  };
};
