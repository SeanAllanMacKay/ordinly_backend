import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type AttemptedSignUpWithUnverifiedProps = {
  verificationCode: string;
  referer?: string;
};

export default ({
  verificationCode,
  referer,
}: AttemptedSignUpWithUnverifiedProps) => {
  const verifyUrl = buildUrl(referer, `verify-account?code=${verificationCode}`);
  const heading = "Your account just needs verifying";

  return {
    subject: "Verify your email to finish signing up",
    html: wrapHtml({
      preheader: "Your account already exists — confirm your email to activate it.",
      heading,
      bodyHtml:
        paragraph(
          "Someone just tried to sign up with this email address. An account already exists, but it hasn't been verified yet.",
        ) +
        paragraph(
          "Confirm your email below to activate your account and start planning.",
        ),
      cta: { href: verifyUrl, label: "Verify my email" },
      footnote: `If the button doesn't work, paste this link into your browser:<br />${verifyUrl}`,
    }),
    text: wrapText({
      heading,
      lines: [
        "Someone just tried to sign up with this email address. An account already exists, but it hasn't been verified yet.",
        "Confirm your email to activate your account and start planning.",
      ],
      cta: { href: verifyUrl, label: "Verify my email" },
    }),
  };
};
