"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  pauseCampaignAction,
  resumeCampaignAction,
  deleteCampaignAction,
} from "@/lib/actions/campaigns";

export type CampaignStatus = "active" | "paused" | "deleted";

// Pause freezes the creator's numbers (their /creator/[code] page keeps
// working); delete blocks that page entirely. Neither ever touches PrizeUp's
// own referral redirect (/i/<code>) — that keeps working either way.
export function CampaignActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: CampaignStatus;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  if (status === "deleted") {
    return <span className="text-xs text-muted">—</span>;
  }

  function pause() {
    start(async () => {
      const res = await pauseCampaignAction(campaignId);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        return;
      }
      toast.success("Paused — the creator's numbers are frozen; their link keeps working.");
      router.refresh();
    });
  }

  function resume() {
    start(async () => {
      const res = await resumeCampaignAction(campaignId);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        return;
      }
      toast.success("Resumed — numbers are live again.");
      router.refresh();
    });
  }

  function del() {
    if (
      !window.confirm(
        "Delete this campaign? The creator will no longer be able to view their stats page. Their referral link keeps working either way.",
      )
    ) {
      return;
    }
    start(async () => {
      const res = await deleteCampaignAction(campaignId);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        return;
      }
      toast.success("Deleted — the creator's stats page is now blocked.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === "active" ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={pause}
          disabled={pending}
          title="Pause — freezes the creator's numbers, their link keeps working"
        >
          <Pause className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={resume}
          disabled={pending}
          title="Resume — numbers go live again"
        >
          <Play className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={del}
        disabled={pending}
        title="Delete — blocks the creator's stats page"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
