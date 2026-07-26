"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { updateDisplayPercentageAction } from "@/lib/actions/campaigns";

// Inline-editable "what % of the real count does the creator see" control.
// Saves on blur/Enter. Server Action + RLS both enforce that an admin can
// only touch their own campaigns; super_admin can touch any.
export function CampaignPercentageCell({
  campaignId,
  initialPercentage,
}: {
  campaignId: string;
  initialPercentage: number;
}) {
  const [value, setValue] = useState(String(initialPercentage));
  const [pending, start] = useTransition();
  const router = useRouter();

  function save() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      toast.error("Enter a whole number between 1 and 500");
      setValue(String(initialPercentage));
      return;
    }
    if (n === initialPercentage) return;
    start(async () => {
      const res = await updateDisplayPercentageAction(campaignId, n);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        setValue(String(initialPercentage));
        return;
      }
      toast.success("Updated — the creator's public link now shows this scaled number");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        disabled={pending}
        inputMode="numeric"
        className="h-8 w-16 px-2 text-right text-xs"
      />
      <span className="text-xs text-muted">%</span>
    </div>
  );
}
