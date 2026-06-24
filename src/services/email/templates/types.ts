/**
 * The shape every email template returns: the rendered subject + HTML body, plus
 * an optional plaintext alternative. Sending both (a multipart message) improves
 * deliverability and renders for clients that don't show HTML.
 * Templates are pure functions of their props — they never touch the provider.
 */
export type EmailContent = {
  subject: string;
  html: string;
  text?: string;
};

/** An email template: maps typed props to rendered content. */
export type EmailTemplate = (props: any) => EmailContent;
