import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyInvitedToPersonalProjectProps = {
  userName: string;
  companyName: string;
  referer?: string;
};

export default ({
  userName,
  companyName,
  referer,
}: CompanyInvitedToPersonalProjectProps) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = `${userName} invited you to a project`;

  return {
    subject: `${userName} invited you to collaborate on a project`,
    html: wrapHtml({
      preheader: `${userName} wants to work with ${companyName} on a personal project.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${userName}</strong> has invited <strong>${companyName}</strong> to collaborate on a personal project.`,
        ) +
        paragraph("Log in to accept the invitation and start working together."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${userName} has invited ${companyName} to collaborate on a personal project.`,
        "Log in to accept the invitation and start working together.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
