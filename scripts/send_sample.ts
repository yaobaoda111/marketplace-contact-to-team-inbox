import { routeMarketplaceContact } from "../src/marketplace_contact.ts";

const inbox = process.env.TEAM_INBOX;
if (!inbox) throw new Error("Set TEAM_INBOX to the address that receives marketplace questions.");

const result = await routeMarketplaceContact(inbox, {
  course: "Practical TypeScript",
  name: "Avery Chen",
  email: "avery@example.com",
  message: "Does this course include exercises for API error handling?",
});

console.log(`Contact delivered with message_id ${result.message_id}`);
