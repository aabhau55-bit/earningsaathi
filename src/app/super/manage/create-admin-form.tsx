"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { createAdminAction } from "@/lib/actions/super";

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

export function CreateAdminForm({ apps }: { apps: { slug: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [appSlug, setAppSlug] = useState(apps[0]?.slug ?? "");
  // Guard against a stale selection when the apps list changes after mount
  // (e.g. right after registering the first app): fall back to the first app.
  const effectiveSlug = apps.some((a) => a.slug === appSlug)
    ? appSlug
    : (apps[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; password: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (apps.length === 0) {
    return (
      <Card>
        <CardHeader title="Create admin" />
        <CardBody>
          <EmptyState title="Register an app first" description="Admins are assigned to an app." />
        </CardBody>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-good" /> Admin created
            </span>
          }
          description="Share these credentials with the admin."
        />
        <CardBody className="space-y-3">
          <div className="rounded-lg border border-hairline bg-surface-2 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted">Login email</span>
              <span className="flex items-center gap-2">
                <code className="font-mono text-xs text-ink">{done.email}</code>
                <CopyButton value={done.email} label="" />
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-2">
              <span className="text-muted">Password (shown once)</span>
              <span className="flex items-center gap-2">
                <code className="font-mono text-xs text-ink">{done.password}</code>
                <CopyButton value={done.password} label="" />
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => { setDone(null); setName(""); setEmail(""); setPassword(""); }}>
            <Plus className="h-4 w-4" /> Create another
          </Button>
        </CardBody>
      </Card>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createAdminAction({ email, password, name, appSlug: effectiveSlug });
      if (!res.ok) { setError(res.error); toast.error("Could not create admin"); return; }
      setDone({ email: res.email, password: res.password });
      toast.success("Admin created");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader title="Create admin" description="Provisions an admin scoped to one app." />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="adname">
            <Input id="adname" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Verma" />
          </Field>
          <Field label="App" htmlFor="adapp">
            <select id="adapp" value={effectiveSlug} onChange={(e) => setAppSlug(e.target.value)}
              className="h-10 w-full rounded-lg border border-hairline bg-surface px-3 text-sm text-ink outline-none focus:border-baseline focus:ring-2 focus:ring-baseline/40">
              {apps.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Email (login)" htmlFor="ademail">
            <Input id="ademail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gmail.com" />
          </Field>
          <Field label="Password" htmlFor="adpass" hint="min 8 characters">
            <div className="flex gap-2">
              <Input id="adpass" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
              <Button type="button" variant="secondary" onClick={() => setPassword(genPassword())} title="Generate">
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </Field>
          {error && <p className="text-sm text-critical sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create admin"}</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
