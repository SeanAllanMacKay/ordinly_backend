/**
 * Render every email template to a single HTML file so the whole suite can be
 * eyeballed in a browser. Not part of the running app — run it with:
 *
 *   yarn email:preview        # writes email-preview.html and opens it
 *
 * Each template is rendered with representative sample props (including a sample
 * `referer` so links resolve), and both the HTML and the plaintext alternative
 * are shown side by side.
 */
import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { emailTemplates } from "./templates/index.js";
import type { EmailType } from "./templates/index.js";

// Pretend the request came from here so referer-derived links have a host.
const referer = "https://app.ordinly.com/landing";

/** Representative props for each template type. */
const sampleProps: Record<EmailType, Record<string, unknown>> = {
  attemptedSignUp: { referer },
  successfulSignUp: { verificationCode: "VERIFY-CODE-123", referer },
  accountVerified: { referer },
  attemptedSignUpWithUnverified: { verificationCode: "VERIFY-CODE-123", referer },
  existingUserInvitedToCompany: { companyName: "Acme Construction", referer },
  newUserInvitedToCompany: { companyName: "Acme Construction", referer },
  revokedInvitationToCompany: { companyName: "Acme Construction" },
  acceptedInvitationToCompany: {
    userName: "Jane Doe",
    companyName: "Acme Construction",
    referer,
  },
  declinedInvitationToCompany: {
    userName: "Jane Doe",
    companyName: "Acme Construction",
    referer,
  },
  removedFromCompany: { companyName: "Acme Construction" },
  missedPayment: { companyName: "Acme Construction", referer },
  changedPassword: { referer },
  clientInvitedToCompany: {
    companyName: "Acme Construction",
    clientName: "Beta Developments",
    referer,
  },
  companyInvitedToPersonalProject: {
    userName: "Jane Doe",
    companyName: "Acme Construction",
    referer,
  },
  revokeInvitationToPersonalProject: {
    userName: "Jane Doe",
    companyName: "Acme Construction",
  },
  companyInvitedToCompanyProject: {
    userName: "Jane Doe",
    toCompanyName: "Beta Developments",
    fromCompanyName: "Acme Construction",
    referer,
  },
  companyCreated: { companyName: "Acme Construction", referer },
  companyOnboarding: { companyName: "Acme Construction", referer },
  companyFreeTrialHalfOver: { companyName: "Acme Construction", referer },
  companyFreeTrialOverInTwoDays: { companyName: "Acme Construction", referer },
  companyFreeTrialExpiredNoSubscription: { companyName: "Acme Construction", referer },
  companyFreeTrialExpiredWithSubscription: { companyName: "Acme Construction", referer },
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sections: string[] = [];

for (const [type, template] of Object.entries(emailTemplates)) {
  const { subject, html, text } = template(sampleProps[type as EmailType]);
  sections.push(`
    <section style="margin:0 0 48px;">
      <p style="font:600 13px/1.4 ui-monospace,monospace;color:#6b7280;margin:0 0 4px;">${type}</p>
      <p style="font:700 18px/1.4 system-ui;color:#111;margin:0 0 12px;">${escape(subject)}</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
        <iframe srcdoc="${escape(html).replace(/"/g, "&quot;")}" style="width:620px;height:520px;border:1px solid #ddd;border-radius:8px;background:#fff;"></iframe>
        <pre style="flex:1;min-width:280px;margin:0;padding:16px;background:#f6f7f9;border:1px solid #ddd;border-radius:8px;font:13px/1.6 ui-monospace,monospace;white-space:pre-wrap;color:#333;">${escape(text ?? "(no plaintext)")}</pre>
      </div>
    </section>`);
}

const page = `<!doctype html><html><head><meta charset="utf-8"><title>Ordinly email preview</title></head>
<body style="margin:0;padding:32px;background:#fff;font-family:system-ui;">
  <h1 style="font-size:24px;">Ordinly email previews</h1>
  <p style="color:#6b7280;">${Object.keys(emailTemplates).length} templates · left: HTML · right: plaintext alternative</p>
  ${sections.join("\n")}
</body></html>`;

const outPath = fileURLToPath(new URL("../../../email-preview.html", import.meta.url));
writeFileSync(outPath, page);
console.log(`Wrote preview for ${Object.keys(emailTemplates).length} templates to:\n  ${outPath}`);

// Best-effort: open it in the default browser (macOS `open`). Ignore failures.
execFile("open", [outPath], (err) => {
  if (err) console.log("Open it manually in your browser.");
});
