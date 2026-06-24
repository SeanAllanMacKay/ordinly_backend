import { paragraph, wrapHtml, wrapText } from "./layout.js";

type RevokedInvitationToCompanyProps = {
  companyName: string;
};

export default ({ companyName }: RevokedInvitationToCompanyProps) => {
  const heading = `Your invitation to ${companyName} was revoked`;

  return {
    subject: `Your invitation to ${companyName} was revoked`,
    html: wrapHtml({
      preheader: `The invitation to join ${companyName} is no longer available.`,
      heading,
      bodyHtml: paragraph(
        `The invitation to join <strong>${companyName}</strong> on Ordinly has been revoked, so it can no longer be accepted.`,
      ),
      footnote:
        "If you were expecting to join, reach out to the company to request a new invitation.",
    }),
    text: wrapText({
      heading,
      lines: [
        `The invitation to join ${companyName} on Ordinly has been revoked, so it can no longer be accepted.`,
        "If you were expecting to join, reach out to the company to request a new invitation.",
      ],
    }),
  };
};
