"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthResult } from "@/server/actions/auth";

export function AuthForm({
  action,
  children,
  submitLabel,
}: {
  action: (prev: AuthResult, formData: FormData) => Promise<AuthResult>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Please wait..." : submitLabel}
      </Button>
    </form>
  );
}
