import { buildUrl, featureList, paragraph, wrapHtml, wrapText } from "./layout.js";
import type { Feature } from "./layout.js";

type CompanyFreeTrialExpiredWithSubscriptionProps = {
  companyName: string;
  referer?: string;
};

export default ({
  companyName,
  referer,
}: CompanyFreeTrialExpiredWithSubscriptionProps) => {
  const heading = `${companyName} is all set on Ordinly`;

  const features: Feature[] = [
    {
      title: "Plan projects",
      description: "Keep every project organised and moving forward.",
      href: buildUrl(referer, "projects"),
      linkLabel: "Go to projects",
    },
    {
      title: "Track tasks",
      description: "Assign work and follow progress in real time.",
      href: buildUrl(referer, "tasks"),
      linkLabel: "Go to tasks",
    },
    {
      title: "Collaborate with your team",
      description: "Manage members and role-based access.",
      href: buildUrl(referer, "team"),
      linkLabel: "Go to team",
    },
    {
      title: "Manage clients",
      description: "Keep client contacts and details in one place.",
      href: buildUrl(referer, "clients"),
      linkLabel: "Go to clients",
    },
  ];

  return {
    subject: `${companyName}'s subscription is active — thank you!`,
    html: wrapHtml({
      preheader: `Your trial is over and ${companyName}'s subscription is active.`,
      heading,
      bodyHtml:
        paragraph(
          `Your free trial has ended and <strong>${companyName}</strong>'s subscription is now active — thank you for choosing Ordinly!`,
        ) +
        paragraph(
          `Everything you've built with ${companyName} keeps running without interruption. Here's where to pick things up:`,
        ) +
        featureList(features),
    }),
    text: wrapText({
      heading,
      lines: [
        `Your free trial has ended and ${companyName}'s subscription is now active — thank you for choosing Ordinly!`,
        `Everything you've built with ${companyName} keeps running without interruption. Here's where to pick things up:`,
        features.map((f) => `• ${f.title}: ${f.description} (${f.href})`).join("\n"),
      ],
    }),
  };
};
