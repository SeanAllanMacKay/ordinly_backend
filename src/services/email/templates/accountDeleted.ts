import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AccountDeletedProps = {
  /** How many days the account can still be restored. */
  graceDays?: number;
  referer?: string;
};

// Sent when a user deletes their account. The account and everything they own
// is soft-deleted immediately and permanently erased after the grace window;
// logging back in before then restores it.
export default ({ graceDays = 30, referer }: AccountDeletedProps = {}) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = "Your account has been deleted";
  const lines = [
    "Your Ordinly account, your personal workspace, and everything in it have been deleted.",
    `You have <strong>${graceDays} days</strong> to change your mind. Logging back in with your email and password before then will fully restore your account and all of its data.`,
    `After ${graceDays} days everything is permanently erased and cannot be recovered.`,
  ];

  return {
    subject: "Your Ordinly account has been deleted",
    html: wrapHtml({
      preheader: `You can restore your account within ${graceDays} days.`,
      heading,
      bodyHtml: lines.map(paragraph).join(""),
      cta: { href: loginUrl, label: "Restore my account" },
      footnote: `If you didn't request this, restore your account and change your password right away, or contact us.`,
    }),
    text: wrapText({
      heading,
      lines: [
        "Your Ordinly account, your personal workspace, and everything in it have been deleted.",
        `You have ${graceDays} days to change your mind. Logging back in with your email and password before then will fully restore your account and all of its data.`,
        `After ${graceDays} days everything is permanently erased and cannot be recovered.`,
      ],
      cta: { href: loginUrl, label: "Restore my account" },
    }),
  };
};
