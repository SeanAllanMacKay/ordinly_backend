import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type MissedPaymentProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: MissedPaymentProps) => {
  const billingUrl = buildUrl(referer, "?form=login");
  const heading = "We couldn't process your payment";

  return {
    subject: `Payment issue for ${companyName}`,
    html: wrapHtml({
      preheader: `Update your payment method to keep ${companyName} active.`,
      heading,
      bodyHtml:
        paragraph(
          `We were unable to process the payment method on file for <strong>${companyName}</strong>.`,
        ) +
        paragraph(
          "To avoid any interruption to your account, please update your payment details.",
        ),
      cta: { href: billingUrl, label: "Update payment method" },
      footnote:
        "Already updated your details? You can safely ignore this message.",
    }),
    text: wrapText({
      heading,
      lines: [
        `We were unable to process the payment method on file for ${companyName}.`,
        "To avoid any interruption to your account, please update your payment details.",
      ],
      cta: { href: billingUrl, label: "Update payment method" },
    }),
  };
};
