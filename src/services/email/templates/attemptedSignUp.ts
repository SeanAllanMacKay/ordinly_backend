import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AttemptedSignUpProps = {
  referer?: string;
};

export default ({ referer }: AttemptedSignUpProps = {}) => {
  const loginUrl = buildUrl(referer, "?form=login");
  const heading = "You already have an Ordinly account";

  return {
    subject: "Someone tried to sign up with your email",
    html: wrapHtml({
      preheader: "This email already has an Ordinly account — just log in.",
      heading,
      bodyHtml:
        paragraph(
          "Someone just tried to create an Ordinly account with this email address, but an account already exists.",
        ) +
        paragraph("If that was you, simply log in to continue."),
      cta: { href: loginUrl, label: "Log in to Ordinly" },
      footnote:
        "If this wasn't you, no account was created and you can safely ignore this email.",
    }),
    text: wrapText({
      heading,
      lines: [
        "Someone just tried to create an Ordinly account with this email address, but an account already exists.",
        "If that was you, simply log in to continue. If it wasn't, you can safely ignore this email.",
      ],
      cta: { href: loginUrl, label: "Log in to Ordinly" },
    }),
  };
};
