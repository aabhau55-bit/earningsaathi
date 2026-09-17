"use server";

import { requireSuperAdmin } from "@/lib/actions/guard";
import { getPrizeUpUrl, getPushSendSecret } from "@/lib/env";

/**
 * Sending push to PrizeUp's users.
 *
 * The actual delivery lives in the app's `push-send` Edge Function (segments
 * are resolved in SQL there, so "who receives this" can never be assembled
 * from anything typed into a form). This is the console for it.
 *
 * Mirrors the segments in `public.push_targets` — an unknown one reaches
 * nobody rather than everybody, and that property is enforced on both sides.
 */
export const PUSH_SEGMENTS = ["all", "streak_at_risk", "idle"] as const;
export type PushSegment = (typeof PUSH_SEGMENTS)[number];

export type PushInput = {
  segment: PushSegment;
  title: string;
  body: string;
  /** In-app path to open on tap, e.g. "/streak". */
  url?: string;
  /** 'idle' only. */
  days?: number;
  maxDays?: number;
};

export type PushResult =
  | {
      ok: true;
      dryRun: boolean;
      segment: string;
      audience: number;
      sent?: number;
      retired?: number;
      failureCount?: number;
    }
  | { ok: false; error: string };

function validate(input: PushInput): string | null {
  if (!PUSH_SEGMENTS.includes(input.segment)) return "Pick a valid audience.";
  if (!input.title.trim()) return "Title is required.";
  if (!input.body.trim()) return "Message is required.";
  if (input.title.length > 100) return "Title is too long (100 characters max).";
  if (input.body.length > 300) return "Message is too long (300 characters max).";
  // Same rule the app applies before navigating (notificationRoute): in-app
  // paths only, so a campaign can't send users somewhere arbitrary.
  const url = input.url?.trim();
  if (url && (!url.startsWith("/") || url.startsWith("//") || url.includes("..")))
    return 'Link must be an in-app path starting with "/", e.g. /streak';
  return null;
}

async function call(input: PushInput, dryRun: boolean): Promise<PushResult> {
  // Server Actions are real endpoints, reachable regardless of which page
  // renders the button — so authorization is checked here, not by placement.
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard;

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const url = input.url?.trim();

  try {
    const res = await fetch(`${getPrizeUpUrl()}/functions/v1/push-send`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-push-secret": getPushSendSecret(),
      },
      body: JSON.stringify({
        segment: input.segment,
        title: input.title.trim(),
        body: input.body.trim(),
        ...(url ? { url } : {}),
        ...(input.segment === "idle"
          ? { days: input.days ?? 3, maxDays: input.maxDays ?? 30 }
          : {}),
        dryRun,
      }),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as
      | (PushResult & { reason?: string })
      | null;

    if (!res.ok || !json) {
      return {
        ok: false,
        error:
          json && "reason" in json && json.reason
            ? String(json.reason)
            : `Push service returned ${res.status}.`,
      };
    }
    if (json.ok === false) {
      return { ok: false, error: json.reason ?? "Push service rejected it." };
    }
    return json;
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Resolve the audience and report its size. Sends nothing. */
export async function previewPushAction(input: PushInput): Promise<PushResult> {
  return call(input, true);
}

/** Actually send. The UI requires a preview first, so the size is never a surprise. */
export async function sendPushAction(input: PushInput): Promise<PushResult> {
  return call(input, false);
}
