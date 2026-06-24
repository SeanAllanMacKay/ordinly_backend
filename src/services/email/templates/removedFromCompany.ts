import { paragraph, wrapHtml, wrapText } from "./layout.js";

type RemovedFromCompanyProps = {
  companyName: string;
};

export default ({ companyName }: RemovedFromCompanyProps) => {
  const heading = `You've been removed from ${companyName}`;

  return {
    subject: `You've been removed from ${companyName}`,
    html: wrapHtml({
      preheader: `Your access to ${companyName} on Ordinly has been removed.`,
      heading,
      bodyHtml:
        paragraph(
          `Your access to <strong>${companyName}</strong> on Ordinly has been removed. You'll no longer see their projects or data.`,
        ) +
        paragraph(
          "If you think this was a mistake, please reach out to someone at the company directly.",
        ),
    }),
    text: wrapText({
      heading,
      lines: [
        `Your access to ${companyName} on Ordinly has been removed. You'll no longer see their projects or data.`,
        "If you think this was a mistake, please reach out to someone at the company directly.",
      ],
    }),
  };
};
