import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AcceptedInvitationProps = {
  userName: string;
  companyName: string;
  referer?: string;
};

export default ({ userName, companyName, referer }: AcceptedInvitationProps) => {
  const appUrl = buildUrl(referer, "?form=login");
  const heading = `${userName} joined ${companyName}`;

  return {
    subject: `${userName} accepted your invitation`,
    html: wrapHtml({
      preheader: `${userName} is now part of ${companyName} on Ordinly.`,
      heading,
      bodyHtml: paragraph(
        `<strong>${userName}</strong> has accepted your invitation and is now part of <strong>${companyName}</strong> on Ordinly.`,
      ),
      cta: { href: appUrl, label: "View your team" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${userName} has accepted your invitation and is now part of ${companyName} on Ordinly.`,
      ],
      cta: { href: appUrl, label: "View your team" },
    }),
  };
};
