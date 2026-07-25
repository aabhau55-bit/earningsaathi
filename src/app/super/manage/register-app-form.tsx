"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { registerAppAction } from "@/lib/actions/super";

export function RegisterAppForm() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await registerAppAction(slug, name);
      if (!res.ok) {
        setError(res.error ?? "Failed");
        return;
      }
      toast.success(`App "${name}" registered`);
      setSlug("");
      setName("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader title="Register app" description="Add an app to the registry (e.g. cashrabbit)." />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" htmlFor="aslug" hint="lowercase id, e.g. cashrabbit">
            <Input id="aslug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="cashrabbit" />
          </Field>
          <Field label="Display name" htmlFor="aname">
            <Input id="aname" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Cash Rabbit" />
          </Field>
          {error && <p className="text-sm text-critical sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Registering…" : "Register app"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
