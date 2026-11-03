export type Brief = {
  message: string;
  contact: string;
  kinds: string[];
  timing: string;
  /** Honeypot: real visitors never see or fill this field. */
  website: string;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;
const MIN_INTERVAL_MS = 30_000;
let lastSentAt = 0;

/** Accepts one email address or one phone number. */
export function isValidContact(value: string) {
  const text = value.trim();
  return EMAIL.test(text) || (PHONE.test(text) && /\d{7,}/.test(text.replace(/\D/g, "")));
}

/**
 * Sends a brief to the team.
 *
 * TODO(backend): replace the simulated delivery below with a real one before
 * launch. Planned flow:
 *   1. POST the brief to a Next.js route handler (app/api/brief/route.ts).
 *   2. Re-validate on the server (same rules as isValidContact), drop requests
 *      where `website` is filled in, and rate-limit by IP (e.g. Upstash or
 *      Vercel KV) because the client-side limit below is easy to bypass.
 *   3. Insert the row into a Supabase `briefs` table (RLS on, no public read).
 *   4. Email an alert to the team inbox (e.g. Resend) with the brief and the
 *      contact details.
 *   5. Return `{ ok: true }`, or `{ ok: false, error }` for the form to show.
 * Update the Privacy Policy (processors, retention) when this goes live.
 */
export async function submitBrief(brief: Brief): Promise<SubmitResult> {
  if (brief.website) return { ok: true }; // spam bot: pretend it worked
  if (!brief.message.trim()) {
    return { ok: false, error: "Tell us a little about the project first." };
  }
  if (!isValidContact(brief.contact)) {
    return {
      ok: false,
      error: "Add an email address or phone number so we can reply.",
    };
  }
  if (Date.now() - lastSentAt < MIN_INTERVAL_MS) {
    return { ok: false, error: "Please wait a moment before sending again." };
  }
  lastSentAt = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ok: true };
}
