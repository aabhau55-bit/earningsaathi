"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { adjustBalanceAction } from "@/lib/actions/user-balance";

export function AdjustBalanceForm({ prizeupUserId }: { prizeupUserId: string }) {
  const [coinsDelta, setCoinsDelta] = useState("");
  const [gemsDelta, setGemsDelta] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const coins = coinsDelta.trim() === "" ? 0 : Number(coinsDelta);
    const gems = gemsDelta.trim() === "" ? 0 : Number(gemsDelta);
    if (!Number.isInteger(coins) || !Number.isInteger(gems)) {
      setError("Coins and gems must be whole numbers");
      return;
    }
    if (coins === 0 && gems === 0) {
      setError("Enter a non-zero coins or gems amount");
      return;
    }

    startTransition(async () => {
      const res = await adjustBalanceAction({
        prizeupUserId,
        coinsDelta: coins,
        gemsDelta: gems,
        reason,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error("Adjustment failed");
        return;
      }
      setCoinsDelta("");
      setGemsDelta("");
      setReason("");
      router.refresh();
      toast.success(
        `Balance updated — now ${res.coins.toLocaleString()} coins, ${res.gems.toLocaleString()} gems`,
      );
    });
  }

  return (
    <Card>
      <CardHeader
        title="Adjust balance"
        description="Positive to add, negative to subtract. Applies immediately and is logged."
      />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
          <Field label="Coins" htmlFor="coinsDelta" hint="e.g. 500 or -200">
            <Input
              id="coinsDelta"
              type="number"
              value={coinsDelta}
              onChange={(e) => setCoinsDelta(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Gems" htmlFor="gemsDelta" hint="e.g. 100 or -50">
            <Input
              id="gemsDelta"
              type="number"
              value={gemsDelta}
              onChange={(e) => setGemsDelta(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Reason" htmlFor="reason" hint="Required — shown in the audit log">
            <Input
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Compensating a bug report"
            />
          </Field>

          {error && <p className="text-sm text-critical sm:col-span-3">{error}</p>}

          <div className="sm:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Applying…" : "Apply adjustment"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
