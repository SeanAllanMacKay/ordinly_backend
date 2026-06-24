import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyInvitedToCompanyProjectProps = {
  userName: string;
  toCompanyName: string;
  fromCompanyName: string;
  referer?: string;
};

export default ({
  userName,
  toCompanyName,
  fromCompanyName,
  referer,
}: CompanyInvitedToCompanyProjectProps) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = `${fromCompanyName} invited you to a project`;

  return {
    subject: `${fromCompanyName} invited you to collaborate on a project`,
    html: wrapHtml({
      preheader: `${userName} invited ${toCompanyName} to a ${fromCompanyName} project.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${userName}</strong> has invited <strong>${toCompanyName}</strong> to collaborate on one of <strong>${fromCompanyName}</strong>'s projects.`,
        ) +
        paragraph("Log in to accept the invitation and start working together."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${userName} has invited ${toCompanyName} to collaborate on one of ${fromCompanyName}'s projects.`,
        "Log in to accept the invitation and start working together.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
