import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type ExistingUserInvitedToCompanyProps = {
  companyName: string;
  referer?: string;
};

export default ({
  companyName,
  referer,
}: ExistingUserInvitedToCompanyProps) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = `You've been added to ${companyName}`;

  return {
    subject: `You've been added to ${companyName} on Ordinly`,
    html: wrapHtml({
      preheader: `${companyName} added you to their team on Ordinly.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${companyName}</strong> has added you to their team on Ordinly.`,
        ) +
        paragraph("Log in to your account to start collaborating with them."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${companyName} has added you to their team on Ordinly.`,
        "Log in to your account to start collaborating with them.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
