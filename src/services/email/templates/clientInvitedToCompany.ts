import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type ClientInvitedToCompanyProps = {
  companyName: string;
  clientName: string;
  referer?: string;
};

export default ({
  companyName,
  clientName,
  referer,
}: ClientInvitedToCompanyProps) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = `${companyName} invited you to collaborate`;

  return {
    subject: `${companyName} invited you to work together on Ordinly`,
    html: wrapHtml({
      preheader: `${companyName} wants to collaborate with ${clientName} on Ordinly.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${companyName}</strong> has invited <strong>${clientName}</strong> to collaborate with them on Ordinly.`,
        ) +
        paragraph("Log in to view shared projects and start working together."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${companyName} has invited ${clientName} to collaborate with them on Ordinly.`,
        "Log in to view shared projects and start working together.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
