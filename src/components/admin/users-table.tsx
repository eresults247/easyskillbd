"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { updateUserRoleAction, updateUserStatusAction } from "@/server/actions/admin";
import { useToast } from "@/components/providers/toast-provider";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  status: "active" | "pending" | "suspended";
  avatarUrl: string | null;
  createdAt: string;
};

const statusColor = { active: "success", pending: "warning", suspended: "danger" } as const;

export function UsersTable({ users }: { users: UserRow[] }) {
  const [rows, setRows] = useState(users);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const [filter, setFilter] = useState<"all" | "student" | "instructor" | "admin">("all");

  const filtered = filter === "all" ? rows : rows.filter((r) => r.role === filter);

  function handleStatusChange(id: string, status: UserRow["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      await updateUserStatusAction(id, status);
      push("User status updated", "success");
    });
  }

  function handleRoleChange(id: string, role: UserRow["role"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)));
    startTransition(async () => {
      await updateUserRoleAction(id, role);
      push("User role updated", "success");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        {(["all", "student", "instructor", "admin"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatarUrl} className="h-8 w-8" />
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRow["role"])}
                    disabled={pending}
                    className="h-8 w-32 text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor[u.status]} className="capitalize">{u.status}</Badge>
                    <Select
                      value={u.status}
                      onChange={(e) => handleStatusChange(u.id, e.target.value as UserRow["status"])}
                      disabled={pending}
                      className="h-8 w-28 text-xs"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
