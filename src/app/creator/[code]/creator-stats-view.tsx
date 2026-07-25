"use client";

import { useState, type FormEvent } from "react";
import { Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import {
  getCreatorStatsAction,
  type CreatorStatsResult,
} from "@/lib/actions/creator-stats";

const num = (n: number) => n.toLocaleString();

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-2 px-2 py-3 text-center">
      <div className="text-lg font-semibold text-ink sm:text-xl">{num(value)}</div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

// Public, email-gated stats view. No login: the referral code in the URL
// plus the email the creator types are checked together, server-side,
// against PrizeUp's real referrals table.
export function CreatorStatsView({ code }: { code: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    Extract<CreatorStatsResult, { ok: true }> | null
  >(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await getCreatorStatsAction(code, email);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-12">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(100deg,#22c55e,#15803d)] text-white shadow-sm">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Your Referral Stats
          </h1>
          <p className="mt-1 text-sm text-muted">
            {result
              ? `Hi ${result.username ?? "there"} — here's how your link is doing.`
              : "Enter the email your link was created with."}
          </p>
        </div>

        {!result ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            {error && <p className="text-sm text-critical">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Checking…" : "View my stats"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-hairline bg-surface-2 p-6 text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Lifetime referrals
              </div>
              <div className="mt-2 text-5xl font-bold tracking-tight text-ink">
                {num(result.lifetime)}
              </div>
              <p className="mt-1 text-sm text-muted">
                people joined PrizeUp through your link
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <MiniStat label="Last hour" value={result.lastHour} />
              <MiniStat label="Last 24h" value={result.lastDay} />
              <MiniStat label="Last 7d" value={result.lastWeek} />
              <MiniStat label="Last 30d" value={result.lastMonth} />
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
