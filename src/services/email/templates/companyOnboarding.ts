import { buildUrl, featureList, paragraph, wrapHtml, wrapText } from "./layout.js";
import type { Feature } from "./layout.js";

type CompanyOnboardingProps = {
  companyName: string;
  referer?: string;
};

export default ({ companyName, referer }: CompanyOnboardingProps) => {
  const companyUrl = buildUrl(referer, "dashboard");
  const heading = "Get the most out of Ordinly";

  const features: Feature[] = [
    {
      title: "Plan projects",
      description:
        "Organise your work into projects and keep every detail in one place.",
      href: buildUrl(referer, "projects"),
      linkLabel: "Create a project",
    },
    {
      title: "Track tasks",
      description:
        "Break projects into tasks, assign owners, and watch progress in real time.",
      href: buildUrl(referer, "tasks"),
      linkLabel: "View tasks",
    },
    {
      title: "Invite your team",
      description:
        "Bring colleagues on board and collaborate with role-based access.",
      href: buildUrl(referer, "team"),
      linkLabel: "Invite teammates",
    },
    {
      title: "Manage clients",
      description:
        "Keep client contacts and details organised alongside your work.",
      href: buildUrl(referer, "clients"),
      linkLabel: "Add a client",
    },
  ];

  return {
    subject: `Getting started with ${companyName} on Ordinly`,
    html: wrapHtml({
      preheader: "A quick tour of what you can do with Ordinly.",
      heading,
      bodyHtml:
        paragraph(
          `Now that <strong>${companyName}</strong> is set up, here are a few things you can do to hit the ground running:`,
        ) + featureList(features),
      cta: { href: companyUrl, label: "Open Ordinly" },
    }),
    text: wrapText({
      heading,
      lines: [
        `Now that ${companyName} is set up, here are a few things you can do to hit the ground running:`,
        features.map((f) => `• ${f.title}: ${f.description} (${f.href})`).join("\n"),
      ],
      cta: { href: companyUrl, label: "Open Ordinly" },
    }),
  };
};
