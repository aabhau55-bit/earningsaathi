"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import {
  setRoleAction,
  resetPasswordAction,
  deleteAdminAction,
} from "@/lib/actions/super";
import type { Role } from "@/lib/roles";

export type ManagedUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  app_name: string | null;
};

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

const ROLES: Role[] = ["super_admin", "admin"];

function Row({ u, isSelf }: { u: ManagedUser; isSelf: boolean }) {
  const [role, setRole] = useState<Role>(u.role);
  const [newPassword, setNewPassword] = useState("");
  const [justSet, setJustSet] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function changeRole(next: Role) {
    const prev = role;
    setRole(next);
    start(async () => {
      const res = await setRoleAction(u.email, next);
      if (!res.ok) {
        setRole(prev);
        toast.error(res.error ?? "Failed");
      } else {
        toast.success(`${u.email} is now ${next.replace("_", " ")}`);
        router.refresh();
      }
    });
  }

  function submitReset(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    start(async () => {
      const res = await resetPasswordAction(u.email, newPassword);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        return;
      }
      setJustSet(newPassword);
      setNewPassword("");
      toast.success("Password set");
    });
  }

  function confirmDelete() {
    if (
      !window.confirm(
        `Delete ${u.email}? This removes their login entirely and can't be undone.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await deleteAdminAction(u.id);
      if (!res.ok) {
        toast.error(res.error ?? "Failed");
        return;
      }
      toast.success(`${u.email} deleted`);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-ink">{u.name ?? "—"}</div>
        <div className="truncate text-xs text-muted">{u.email}</div>
      </td>
      <td className="px-4 py-3">
        {u.app_name ? <Badge tone="blue">{u.app_name}</Badge> : <span className="text-muted">—</span>}
      </td>
      <td className="px-4 py-3">
        <select
          value={role}
          disabled={isSelf || pending}
          onChange={(e) => changeRole(e.target.value as Role)}
          className="h-9 rounded-lg border border-hairline bg-surface px-2 text-sm text-ink outline-none focus:border-baseline disabled:opacity-60"
          title={isSelf ? "You can't change your own role" : undefined}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {justSet ? (
          <span className="inline-flex items-center gap-2">
            <code className="font-mono text-xs text-ink">{justSet}</code>
            <CopyButton value={justSet} label="" />
          </span>
        ) : (
          <form onSubmit={submitReset} className="flex items-center gap-1.5">
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="h-9 w-32 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setNewPassword(genPassword())}
              disabled={pending}
              title="Generate a password"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
            <Button type="submit" size="sm" variant="secondary" disabled={pending} title="Set this password">
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
          </form>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="danger"
          onClick={confirmDelete}
          disabled={isSelf || pending}
          title={isSelf ? "You can't delete your own account" : "Delete this account"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

export function RolesTable({ users, currentEmail }: { users: ManagedUser[]; currentEmail: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full min-w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            {["User", "App", "Role", "Password", ""].map((h, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted ${i === 4 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Row key={u.id} u={u} isSelf={u.email.toLowerCase() === currentEmail.toLowerCase()} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
