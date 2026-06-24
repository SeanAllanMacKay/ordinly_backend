import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type SuccessfulSignUpProps = {
  verificationCode: string;
  referer: string;
};

export default ({ verificationCode, referer }: SuccessfulSignUpProps) => {
  const verifyUrl = buildUrl(referer, `verify-account?code=${verificationCode}`);
  const heading = "Welcome to Ordinly!";

  return {
    subject: "Welcome to Ordinly — verify your email",
    html: wrapHtml({
      preheader: "Confirm your email to finish setting up your account.",
      heading,
      bodyHtml:
        paragraph(
          "Thanks for signing up — you're one step away from getting started.",
        ) +
        paragraph(
          "Confirm your email address to activate your account and start planning.",
        ),
      cta: { href: verifyUrl, label: "Verify my email" },
      footnote: `If the button doesn't work, paste this link into your browser:<br />${verifyUrl}`,
    }),
    text: wrapText({
      heading,
      lines: [
        "Thanks for signing up — you're one step away from getting started.",
        "Confirm your email address to activate your account and start planning.",
      ],
      cta: { href: verifyUrl, label: "Verify my email" },
    }),
  };
};
