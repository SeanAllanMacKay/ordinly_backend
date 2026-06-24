import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type NewUserInvitedToCompanyProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: NewUserInvitedToCompanyProps) => {
  const signUpUrl = buildUrl(referer, "?form=signup");
  const heading = `${companyName} invited you to Ordinly`;

  return {
    subject: `${companyName} invited you to join them on Ordinly`,
    html: wrapHtml({
      preheader: `Create your free account to start working with ${companyName}.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${companyName}</strong> has invited you to collaborate with them on Ordinly.`,
        ) +
        paragraph(
          "Create your free account to accept the invitation and get started.",
        ),
      cta: { href: signUpUrl, label: "Create my account" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${companyName} has invited you to collaborate with them on Ordinly.`,
        "Create your free account to accept the invitation and get started.",
      ],
      cta: { href: signUpUrl, label: "Create my account" },
    }),
  };
};
