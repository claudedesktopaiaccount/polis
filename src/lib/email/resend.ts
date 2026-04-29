/**
 * Thin wrapper around the Resend REST API.
 * Does NOT use the Resend SDK — avoids Node.js dependencies incompatible with Workers.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

interface Env {
  RESEND_API_KEY: string;
}

export async function sendEmail(params: SendEmailParams, env: Env): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from ?? "VolímTo <newsletter@volimto.sk>",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}
