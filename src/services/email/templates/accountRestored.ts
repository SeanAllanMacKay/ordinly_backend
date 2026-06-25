import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AccountRestoredProps = {
  referer?: string;
};

// Sent when a user logs back in during the grace window, reversing a pending
// account deletion.
export default ({ referer }: AccountRestoredProps = {}) => {
  const appUrl = buildUrl(referer);
  const heading = "Your account has been restored";
  const lines = [
    "Welcome back! Your Ordinly account and all of its data have been fully restored, and the scheduled deletion has been cancelled.",
    "Everything is right where you left it.",
  ];

  return {
    subject: "Your Ordinly account has been restored",
    html: wrapHtml({
      preheader: "Your account is active again.",
      heading,
      bodyHtml: lines.map(paragraph).join(""),
      cta: { href: appUrl, label: "Open Ordinly" },
      footnote: `If you didn't do this, contact us right away.`,
    }),
    text: wrapText({
      heading,
      lines,
      cta: { href: appUrl, label: "Open Ordinly" },
    }),
  };
};
