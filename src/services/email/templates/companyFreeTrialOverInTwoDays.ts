import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyFreeTrialOverInTwoDaysProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: CompanyFreeTrialOverInTwoDaysProps) => {
  const billingUrl = buildUrl(referer, "settings/billing");
  const heading = "Your free trial ends in 2 days";

  return {
    subject: `${companyName}: your free trial ends in 2 days`,
    html: wrapHtml({
      preheader: "Add payment details now to avoid any disruption of service.",
      heading,
      bodyHtml:
        paragraph(
          `Your free trial for <strong>${companyName}</strong> ends in <strong>2 days</strong>.`,
        ) +
        paragraph(
          "Add your payment information now to ensure there's no disruption of service. Everything you've set up stays exactly as it is.",
        ),
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
    text: wrapText({
      heading,
      lines: [
        `Your free trial for ${companyName} ends in 2 days.`,
        "Add your payment information now to ensure there's no disruption of service. Everything you've set up stays exactly as it is.",
      ],
      cta: { href: billingUrl, label: "Manage subscription" },
    }),
  };
};
