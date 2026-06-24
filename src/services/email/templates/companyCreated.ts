import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyCreatedProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: CompanyCreatedProps) => {
  const billingUrl = buildUrl(referer, "settings/billing");
  const heading = `${companyName} is ready to go`;

  return {
    subject: `${companyName} is set up — your 14-day free trial has begun`,
    html: wrapHtml({
      preheader: `Your 14-day free trial of Ordinly starts now.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${companyName}</strong> has been created on Ordinly — nice work!`,
        ) +
        paragraph(
          "Your <strong>14-day free trial</strong> starts today. You have full access to every feature, no payment details required to get started.",
        ) +
        paragraph(
          "Add a payment method any time to keep things running smoothly once the trial ends — you can manage your subscription whenever you're ready.",
        ),
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${companyName} has been created on Ordinly — nice work!`,
        "Your 14-day free trial starts today. You have full access to every feature, no payment details required to get started.",
        "Add a payment method any time to keep things running smoothly once the trial ends.",
      ],
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
  };
};
