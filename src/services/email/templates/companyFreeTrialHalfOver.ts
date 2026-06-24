import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyFreeTrialHalfOverProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: CompanyFreeTrialHalfOverProps) => {
  const billingUrl = buildUrl(referer, "settings/billing");
  const heading = "You're halfway through your free trial";

  return {
    subject: `${companyName}: you're halfway through your free trial`,
    html: wrapHtml({
      preheader: "Add payment details so there's no disruption when your trial ends.",
      heading,
      bodyHtml:
        paragraph(
          `You're halfway through your 14-day free trial with <strong>${companyName}</strong> — we hope Ordinly is proving its worth.`,
        ) +
        paragraph(
          "Add your payment information now to ensure there's no disruption of service when the trial ends. You won't be charged until the trial is over.",
        ),
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
    text: wrapText({
      heading,
      lines: [
        `You're halfway through your 14-day free trial with ${companyName} — we hope Ordinly is proving its worth.`,
        "Add your payment information now to ensure there's no disruption of service when the trial ends. You won't be charged until the trial is over.",
      ],
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
  };
};
