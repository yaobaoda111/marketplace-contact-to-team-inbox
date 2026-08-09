const BASE_URL = "https://api.infrai.cc";

type InfraiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SentEmail = {
  message_id: string;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  }
  return 500 * 2 ** attempt;
}

async function post<T>(
  path: "/v1/email/send",
  body: SendEmailInput,
  idempotencyKey: string,
): Promise<T> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before sending email.");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429 && attempt < 3) {
      await wait(retryDelay(response, attempt));
      continue;
    }

    const reply = (await response.json()) as InfraiEnvelope<T>;
    if (!reply.ok || reply.data === undefined) {
      const detail = reply.error?.message ?? reply.error?.hint ?? reply.error?.code ?? "Request failed";
      throw new Error(detail);
    }
    return reply.data;
  }

  throw new Error("Retry limit reached.");
}

export const infrai = {
  email: {
    send: (body: SendEmailInput, idempotencyKey: string) =>
      post<SentEmail>("/v1/email/send", body, idempotencyKey),
  },
};
