import { buildUrl, paragraph, wrapHtml, wrapText } from "./layout.js";

type CompanyFreeTrialExpiredNoSubscriptionProps = {
  companyName: string;
  referer?: string;
};

export default ({
  companyName,
  referer,
}: CompanyFreeTrialExpiredNoSubscriptionProps) => {
  const billingUrl = buildUrl(referer, "settings/billing");
  const heading = `${companyName}'s free trial has ended`;

  return {
    subject: `${companyName}'s free trial has ended — add a payment method to continue`,
    html: wrapHtml({
      preheader: `Add a payment method to keep ${companyName} running on Ordinly.`,
      heading,
      bodyHtml:
        paragraph(
          `<strong>${companyName}</strong>'s free trial has ended. Add a payment method to continue right where you left off.`,
        ) +
        paragraph(
          `Everything you've built with ${companyName} — your projects, tasks, team, and clients — is safe and waiting. Reactivate to pick up without missing a beat.`,
        ) +
        paragraph(
          "It only takes a minute, and there's no disruption to your data.",
        ),
      cta: { href: billingUrl, label: "Add a payment method" },
    }),
    text: wrapText({
      heading,
      lines: [
        `${companyName}'s free trial has ended. Add a payment method to continue right where you left off.`,
        `Everything you've built with ${companyName} — your projects, tasks, team, and clients — is safe and waiting. Reactivate to pick up without missing a beat.`,
        "It only takes a minute, and there's no disruption to your data.",
      ],
      cta: { href: billingUrl, label: "Add a payment method" },
    }),
  };
};
