import { createHash } from "node:crypto";
import { infrai, type SendEmailInput, type SentEmail } from "./infrai.ts";

export type MarketplaceContact = {
  course: string;
  name: string;
  email: string;
  message: string;
};

function required(value: string, field: string): string {
  const cleaned = value.trim();
  if (!cleaned) throw new Error(`${field} is required.`);
  return cleaned;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildContactEmail(
  inbox: string,
  contact: MarketplaceContact,
): SendEmailInput {
  const safe = {
    course: escapeHtml(required(contact.course, "course")),
    name: escapeHtml(required(contact.name, "name")),
    email: escapeHtml(required(contact.email, "email")),
    message: escapeHtml(required(contact.message, "message")),
  };

  return {
    to: required(inbox, "inbox"),
    subject: `Marketplace question: ${required(contact.course, "course")}`,
    html: [
      `<h1>New question about ${safe.course}</h1>`,
      `<p><strong>Learner:</strong> ${safe.name} (${safe.email})</p>`,
      `<p>${safe.message.replaceAll("\n", "<br>")}</p>`,
    ].join(""),
  };
}

export async function routeMarketplaceContact(
  inbox: string,
  contact: MarketplaceContact,
): Promise<SentEmail> {
  const email = buildContactEmail(inbox, contact);
  const submissionKey = createHash("sha256")
    .update(JSON.stringify(contact))
    .digest("hex");

  return infrai.email.send(email, `marketplace-contact-${submissionKey}`);
}
