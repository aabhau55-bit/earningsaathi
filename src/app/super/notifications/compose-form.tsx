"use client";

import { useMemo, useState, useTransition } from "react";
import { Bell, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import {
  previewPushAction,
  sendPushAction,
  type PushInput,
  type PushResult,
  type PushSegment,
} from "@/lib/actions/push";

const SEGMENTS: { value: PushSegment; label: string; help: string }[] = [
  {
    value: "streak_at_risk",
    label: "Streak about to break",
    help: "Users with a running streak whose last check-in was 24–48h ago. They can claim right now and lose the streak if they don't — the highest-intent push in the app.",
  },
  {
    value: "idle",
    label: "Recently lapsed",
    help: "Quiet for a few days but seen within the last month. Bounded on purpose: people who left long ago don't come back, they uninstall or report the notification.",
  },
  {
    value: "all",
    label: "Everyone",
    help: "Every registered device. Use sparingly — a push nobody wanted is how a project gets its notifications muted.",
  },
];

/** Somewhere sensible to send people, so the link isn't guesswork. */
const LINKS = ["/streak", "/tasks", "/spin", "/games", "/rewards", "/refer"];

export function ComposeForm() {
  const [segment, setSegment] = useState<PushSegment>("streak_at_risk");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/streak");
  const [days, setDays] = useState(3);
  const [maxDays, setMaxDays] = useState(30);

  const [preview, setPreview] = useState<PushResult | null>(null);
  const [sent, setSent] = useState<PushResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const input: PushInput = useMemo(
    () => ({ segment, title, body, url, days, maxDays }),
    [segment, title, body, url, days, maxDays],
  );

  /**
   * The exact message the preview was run against. Any edit invalidates it, so
   * "Send" can never fire a different message — or a different audience — from
   * the one whose size was just shown.
   */
  const signature = JSON.stringify(input);
  const [previewedSignature, setPreviewedSignature] = useState<string | null>(null);
  const previewValid = previewedSignature === signature && preview?.ok === true;
  const audience = preview?.ok ? preview.audience : 0;

  const runPreview = () =>
    startTransition(async () => {
      setSent(null);
      setConfirming(false);
      const res = await previewPushAction(input);
      setPreview(res);
      setPreviewedSignature(res.ok ? signature : null);
    });

  const runSend = () =>
    startTransition(async () => {
      const res = await sendPushAction(input);
      setSent(res);
      setConfirming(false);
      setPreviewedSignature(null);
    });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title="Compose"
          description="Sent through the app's push-send function. Check the audience before sending."
        />
        <CardBody className="space-y-5">
          <Field label="Audience" hint={SEGMENTS.find((s) => s.value === segment)?.help}>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSegment(s.value)}
                  className={
                    segment === s.value
                      ? "rounded-full border border-baseline bg-surface-2 px-3 py-1.5 text-sm font-medium text-ink"
                      : "rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm text-muted hover:text-ink"
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          {segment === "idle" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quiet for at least (days)">
                <Input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
              </Field>
              <Field label="But seen within (days)">
                <Input
                  type="number"
                  min={2}
                  value={maxDays}
                  onChange={(e) => setMaxDays(Number(e.target.value))}
                />
              </Field>
            </div>
          )}

          <Field label="Title" hint={`${title.length}/100 — Android truncates past roughly 40`}>
            <Input
              value={title}
              maxLength={100}
              placeholder="Your streak ends tonight"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Message" hint={`${body.length}/300`}>
            <textarea
              value={body}
              maxLength={300}
              rows={3}
              placeholder="Check in now to keep it alive"
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-baseline focus:ring-2 focus:ring-baseline/40"
            />
          </Field>

          <Field label="Opens this screen" hint="An in-app path. Leave blank to just open the app.">
            <Input value={url} placeholder="/streak" onChange={(e) => setUrl(e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LINKS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setUrl(l)}
                  className="rounded-md border border-hairline px-2 py-1 text-xs text-muted hover:text-ink"
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-4">
            <Button variant="secondary" onClick={runPreview} disabled={pending}>
              <Users className="h-4 w-4" />
              {pending ? "Checking…" : "Check audience"}
            </Button>

            {previewValid && !confirming && (
              <Button onClick={() => setConfirming(true)} disabled={pending || audience === 0}>
                <Send className="h-4 w-4" />
                {audience === 0 ? "Nobody to send to" : `Send to ${audience.toLocaleString("en-IN")}`}
              </Button>
            )}

            {previewValid && confirming && (
              <>
                <Button variant="danger" onClick={runSend} disabled={pending}>
                  {pending ? "Sending…" : `Yes, send to ${audience.toLocaleString("en-IN")} devices`}
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
                  Cancel
                </Button>
              </>
            )}

            {!previewValid && (
              <span className="text-xs text-muted">
                Check the audience first — the size is worth knowing before it goes out.
              </span>
            )}
          </div>

          {preview && preview.ok === false && (
            <p className="text-sm text-critical">{preview.error}</p>
          )}
          {previewValid && !sent && (
            <p className="text-sm text-ink-2">
              This would reach{" "}
              <span className="font-semibold text-ink">
                {audience.toLocaleString("en-IN")}
              </span>{" "}
              device{audience === 1 ? "" : "s"}. Nothing has been sent.
            </p>
          )}
          {sent && sent.ok && (
            <p className="text-sm text-ink-2">
              Sent to <span className="font-semibold text-ink">{sent.sent ?? 0}</span> of{" "}
              {sent.audience}. {sent.retired ? `${sent.retired} dead token(s) retired. ` : ""}
              {sent.failureCount ? `${sent.failureCount} failure(s).` : ""}
            </p>
          )}
          {sent && sent.ok === false && <p className="text-sm text-critical">{sent.error}</p>}
        </CardBody>
      </Card>

      <Card className="h-fit">
        <CardHeader title="Preview" description="Roughly how it lands on the phone." />
        <CardBody>
          <div className="rounded-xl border border-hairline bg-surface-2 p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-series-5/20 text-series-5">
                <Bell className="h-3 w-3" />
              </span>
              PrizeUp · now
            </div>
            <div className="mt-2 text-sm font-semibold text-ink">
              {title || "Your title appears here"}
            </div>
            <div className="mt-0.5 text-sm text-ink-2">
              {body || "And the message body here."}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Tapping it opens{" "}
            <code className="text-ink-2">{url.trim() || "the app"}</code>.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
