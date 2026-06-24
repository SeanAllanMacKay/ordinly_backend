/**
 * Shared building blocks for transactional emails.
 *
 * Every template renders through these helpers so the whole suite shares one
 * look: a centered ~600px card on a light background, a text "Ordinly" wordmark
 * (no image — there's no finished logo yet), an optional call-to-action button,
 * and a consistent footer. Styles are inline and the button is table-based so it
 * survives Outlook and other strict clients.
 *
 * Links are never hardcoded — they're derived from the request `referer` via
 * `buildUrl`, so emails always point back at the environment the user came from.
 */

/** Centralized brand styling. Tweak here to restyle every email at once. */
export const BRAND = {
  name: "Ordinly",
  accent: "#4f46e5",
  accentDark: "#4338ca",
  text: "#1f2933",
  muted: "#6b7280",
  background: "#f4f5f7",
  card: "#ffffff",
  border: "#e6e8eb",
  supportEmail: "support@ordinly.com",
  // Used only when no referer is available (e.g. an email triggered off-request).
  fallbackBase: "https://ordinly.com",
};

export type Cta = { href: string; label: string };

/**
 * Build an absolute URL from the request `referer`. We use the referer's origin
 * (scheme + host) so links resolve correctly no matter which page the user was
 * on, falling back to the brand base when no referer is present.
 *
 *   buildUrl(referer, "verify-account?code=abc") -> https://app.host/verify-account?code=abc
 *   buildUrl(referer, "?form=login")             -> https://app.host/?form=login
 *   buildUrl(referer)                            -> https://app.host/
 */
export const buildUrl = (referer?: string, path = ""): string => {
  let origin = BRAND.fallbackBase;
  if (referer) {
    try {
      origin = new URL(referer).origin;
    } catch {
      // Malformed referer — keep the fallback base.
    }
  }

  if (!path) return `${origin}/`;
  if (path.startsWith("?") || path.startsWith("#")) return `${origin}/${path}`;
  return `${origin}/${path.replace(/^\/+/, "")}`;
};

/** A styled body paragraph. Compose template bodies from these. */
export const paragraph = (html: string): string =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.text};">${html}</p>`;

/** A small, muted note — good for "if this wasn't you" footnotes. */
export const note = (html: string): string =>
  `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${BRAND.muted};">${html}</p>`;

/** A bulletproof, table-based call-to-action button. */
export const button = ({ href, label }: Cta): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
    <tr>
      <td align="center" bgcolor="${BRAND.accent}" style="border-radius:8px;">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:13px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:${BRAND.accent};">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

export type Feature = {
  title: string;
  description: string;
  href: string;
  /** Link text; defaults to "Open". */
  linkLabel?: string;
};

/**
 * A vertical list of features, each with a title, short description, and a text
 * link. Used by onboarding / re-engagement emails to surface functionality.
 */
export const featureList = (features: Feature[]): string =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">${features
    .map(
      ({ title, description, href, linkLabel = "Open" }) => `
      <tr>
        <td style="padding:12px 0;border-top:1px solid ${BRAND.border};">
          <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:${BRAND.text};">${title}</p>
          <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:${BRAND.muted};">${description}</p>
          <a href="${href}" target="_blank" style="font-size:14px;font-weight:600;color:${BRAND.accent};text-decoration:none;">${linkLabel} &rarr;</a>
        </td>
      </tr>`,
    )
    .join("")}</table>`;

type WrapHtmlProps = {
  /** Hidden inbox-preview line shown next to the subject in most clients. */
  preheader?: string;
  heading: string;
  /** Inner HTML (compose with `paragraph`/`note`). */
  bodyHtml: string;
  cta?: Cta;
  /** Optional small muted note rendered under the body/CTA. */
  footnote?: string;
};

/** Wrap content in the shared responsive shell and return a full HTML document. */
export const wrapHtml = ({
  preheader,
  heading,
  bodyHtml,
  cta,
  footnote,
}: WrapHtmlProps): string => {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};">
    ${
      preheader
        ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BRAND.background};">${preheader}</span>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.background};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
            <tr>
              <td style="padding:8px 4px 20px;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${BRAND.accent};">
                ${BRAND.name}
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND.text};">${heading}</h1>
                ${bodyHtml}
                ${cta ? button(cta) : ""}
                ${footnote ? note(footnote) : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 4px 8px;font-size:13px;line-height:1.6;color:${BRAND.muted};">
                This is an automated message from ${BRAND.name}. Need a hand? Reach us at
                <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.accent};text-decoration:none;">${BRAND.supportEmail}</a>.
                <br />© ${year} ${BRAND.name}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

type WrapTextProps = {
  heading: string;
  /** Body paragraphs as plain strings; joined with blank lines. */
  lines: string[];
  /** Optional CTA rendered as "Label: url". */
  cta?: Cta;
};

/** Plaintext counterpart of `wrapHtml`, kept structurally parallel. */
export const wrapText = ({ heading, lines, cta }: WrapTextProps): string => {
  const year = new Date().getFullYear();
  const parts = [BRAND.name, "", heading, "", lines.join("\n\n")];
  if (cta) parts.push("", `${cta.label}: ${cta.href}`);
  parts.push(
    "",
    "—",
    `This is an automated message from ${BRAND.name}. Need a hand? Reach us at ${BRAND.supportEmail}.`,
    `© ${year} ${BRAND.name}.`,
  );
  return parts.join("\n");
};
