import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type DeclinedInvitationProps = {
  userName: string;
  companyName: string;
  referer?: string;
};

export default ({ userName, companyName, referer }: DeclinedInvitationProps) => {
  const appUrl = buildUrl(referer, "?form=login");
  const heading = `${userName} declined your invitation`;

  return {
    subject: `${userName} declined your invitation`,
    html: wrapHtml({
      preheader: `${userName} won't be joining ${companyName} for now.`,
      heading,
      bodyHtml: paragraph(
        `<strong>${userName}</strong> has declined your invitation to join <strong>${companyName}</strong> on Ordinly.`,
      ),
      cta: { href: appUrl, label: "Manage your team" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${userName} has declined your invitation to join ${companyName} on Ordinly.`,
      ],
      cta: { href: appUrl, label: "Manage your team" },
    }),
  };
};
