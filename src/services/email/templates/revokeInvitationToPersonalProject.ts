import { paragraph, wrapHtml, wrapText } from "./layout.js";

type RevokeInvitationToPersonalProjectProps = {
  userName: string;
  companyName: string;
};

export default ({
  userName,
  companyName,
}: RevokeInvitationToPersonalProjectProps) => {
  const heading = "A project invitation was revoked";

  return {
    subject: `Your invitation to ${userName}'s project was revoked`,
    html: wrapHtml({
      preheader: `${userName} revoked ${companyName}'s invitation to their project.`,
      heading,
      bodyHtml: paragraph(
        `<strong>${userName}</strong> has revoked <strong>${companyName}</strong>'s invitation to collaborate on their personal project.`,
      ),
      footnote:
        "If you were expecting to join, reach out to them to request a new invitation.",
    }),
    text: wrapText({
      heading,
      lines: [
        `${userName} has revoked ${companyName}'s invitation to collaborate on their personal project.`,
        "If you were expecting to join, reach out to them to request a new invitation.",
      ],
    }),
  };
};
