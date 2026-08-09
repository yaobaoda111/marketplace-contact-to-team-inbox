import assert from "node:assert/strict";
import test from "node:test";
import { buildContactEmail } from "../src/marketplace_contact.ts";

test("builds a team-inbox email and escapes learner input", () => {
  const email = buildContactEmail("courses@example.com", {
    course: "TypeScript <Basics>",
    name: "Sam & Lee",
    email: "sam@example.com",
    message: "Can I use <script>alert('x')</script>?\nThank you.",
  });

  assert.equal(email.to, "courses@example.com");
  assert.equal(email.subject, "Marketplace question: TypeScript <Basics>");
  assert.match(email.html, /TypeScript &lt;Basics&gt;/);
  assert.match(email.html, /Sam &amp; Lee/);
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /<br>Thank you\./);
});

test("rejects an empty learner message", () => {
  assert.throws(
    () =>
      buildContactEmail("courses@example.com", {
        course: "TypeScript Basics",
        name: "Sam",
        email: "sam@example.com",
        message: "   ",
      }),
    /message is required/,
  );
});
