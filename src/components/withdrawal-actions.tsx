"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import {
  approveWithdrawalAction,
  fulfillWithdrawalAction,
  rejectWithdrawalAction,
} from "@/lib/actions/withdrawals";

type Status = "pending" | "approved" | "sent" | "rejected";

export function WithdrawalActions({
  redemptionId,
  status,
}: {
  redemptionId: string;
  status: Status;
}) {
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Terminal states — nothing left to do here.
  if (status === "sent" || status === "rejected") return null;

  function runApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveWithdrawalAction(redemptionId);
      if (!res.ok) {
        setError(res.error);
        toast.error("Could not approve");
        return;
      }
      router.refresh();
      toast.success("Marked approved");
    });
  }

  function runFulfill(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fulfillWithdrawalAction(redemptionId, code);
      if (!res.ok) {
        setError(res.error);
        toast.error("Could not fulfill");
        return;
      }
      setCode("");
      router.refresh();
      toast.success("Marked sent — the user can now see this code in-app");
    });
  }

  function runReject(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await rejectWithdrawalAction(redemptionId, reason);
      if (!res.ok) {
        setError(res.error);
        toast.error("Could not reject");
        return;
      }
      setReason("");
      router.refresh();
      toast.success("Rejected — coins refunded to the user");
    });
  }

  return (
    <Card>
      <CardHeader title="Actions" description="Applies immediately and is logged." />
      <CardBody className="space-y-6">
        {status === "pending" && (
          <Button variant="secondary" onClick={runApprove} disabled={pending}>
            {pending ? "Working…" : "Mark approved"}
          </Button>
        )}

        <form onSubmit={runFulfill} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Field
              label="Gift-card code"
              htmlFor="code"
              hint="Marks this sent — the app reveals it to the user"
            >
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
              />
            </Field>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Working…" : "Mark sent"}
          </Button>
        </form>

        <form onSubmit={runReject} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Field
              label="Reject reason"
              htmlFor="reason"
              hint="Required — refunds the coins automatically"
            >
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Out of stock / suspected fraud"
              />
            </Field>
          </div>
          <Button type="submit" variant="danger" disabled={pending}>
            {pending ? "Working…" : "Reject & refund"}
          </Button>
        </form>

        {error && <p className="text-sm text-critical">{error}</p>}
      </CardBody>
    </Card>
  );
}
