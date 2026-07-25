"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { CopyField, CopyButton } from "@/components/ui/copy-button";
import {
  createCampaignAction,
  type CreateCampaignResult,
} from "@/lib/actions/campaigns";
import { creatorStatsUrl } from "@/lib/urls";

export function CreateCampaignForm() {
  const [email, setEmail] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    Extract<CreateCampaignResult, { ok: true }> | null
  >(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setEmail("");
    setCampaignName("");
    setError(null);
    setResult(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createCampaignAction({ email, campaignName });
      if (!res.ok) {
        setError(res.error);
        toast.error("Could not create campaign");
        return;
      }
      setResult(res);
      router.refresh();
      toast.success(res.newlyCreated ? "Campaign created" : "Campaign already tracked");
    });
  }

  if (result) {
    return (
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-good" />
              {result.newlyCreated ? "Campaign created" : "Already tracked"}
            </span>
          }
          description="Share this link with the creator."
        />
        <CardBody className="space-y-5">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink-2">
              1. Referral link (share with users)
            </span>
            <CopyField value={result.referralLink} />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink-2">
              2. Stats link (share with the creator)
            </span>
            <CopyField value={creatorStatsUrl(result.referralCode)} />
            <p className="text-xs text-muted">
              No password — they open this link and enter{" "}
              <span className="font-medium text-ink-2">{result.creatorEmail}</span> to see
              how many installs came through their link.
            </p>
          </div>

          {result.password && (
            <div className="rounded-lg border border-hairline bg-surface-2 p-3 text-sm">
              <p className="mb-2 text-xs text-muted">
                A new PrizeUp account was created for {result.creatorEmail}. If they want to
                open the app directly, here&apos;s the login (shown once):
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted">Password</span>
                <span className="flex items-center gap-2">
                  <code className="font-mono text-xs text-ink">{result.password}</code>
                  <CopyButton value={result.password} label="" />
                </span>
              </div>
            </div>
          )}

          <Button variant="secondary" onClick={reset}>
            <Plus className="h-4 w-4" /> Create another
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Create campaign"
        description="Enter the creator's email — a real PrizeUp account and referral link get created automatically."
      />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Creator email" htmlFor="cemail">
            <Input
              id="cemail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@gmail.com"
            />
          </Field>
          <Field label="Campaign label" htmlFor="cname" hint="For your own reference — optional">
            <Input
              id="cname"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Instagram push — July"
            />
          </Field>

          {error && <p className="text-sm text-critical sm:col-span-2">{error}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create campaign"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
