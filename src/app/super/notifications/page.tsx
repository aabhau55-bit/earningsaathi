import { Smartphone, BellRing } from "lucide-react";
import { prizeupQuery } from "@/lib/prizeup/db";
import { StatCard } from "@/components/ui/stat-card";
import { ComposeForm } from "./compose-form";

/**
 * Push console.
 *
 * The app asked every user for notification permission from day one and never
 * took a token, so nothing could ever be sent. Now that it can, this is where
 * a campaign gets written — the alternative was a curl command carrying a
 * secret that can message every user of the app.
 */

type Reach = {
  live_tokens: string;
  reachable_users: string;
  registered_today: string;
};

export default async function NotificationsPage() {
  // The table is new, so tolerate it not existing yet on a database that
  // hasn't had phase45 applied — an admin page should degrade, not 500.
  let reach: Reach | null = null;
  try {
    const rows = await prizeupQuery<Reach>(`
      select
        (select count(*) from push_tokens where disabled_at is null)              as live_tokens,
        (select count(distinct user_id) from push_tokens where disabled_at is null) as reachable_users,
        (select count(*) from push_tokens
          where disabled_at is null and created_at > now() - interval '24 hours') as registered_today
    `);
    reach = rows[0] ?? null;
  } catch {
    reach = null;
  }

  const num = (v: unknown) => Number(v ?? 0).toLocaleString("en-IN");

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-ink sm:text-xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted">
          Devices register a token when someone opens the app, so reach grows as
          users update — it does not start at your full user base.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label="Devices reachable"
          value={num(reach?.live_tokens)}
          accent="violet"
          icon={<Smartphone className="h-4 w-4" />}
        />
        <StatCard
          label="Users reachable"
          value={num(reach?.reachable_users)}
          hint="a user can have several devices"
          accent="blue"
          icon={<BellRing className="h-4 w-4" />}
        />
        <StatCard
          label="Registered today"
          value={num(reach?.registered_today)}
          hint="last 24 hours"
          accent="aqua"
          icon={<Smartphone className="h-4 w-4" />}
        />
      </div>

      <ComposeForm />
    </section>
  );
}
