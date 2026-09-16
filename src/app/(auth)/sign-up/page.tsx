import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleToggle } from "@/components/auth/role-toggle";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : session.role === "instructor" ? "/instructor" : "/dashboard");
  }
  const { role } = await searchParams;
  const defaultRole = role === "instructor" ? "instructor" : "student";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900">Skillio</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join thousands of learners and instructors on Skillio.</p>

          <div className="mt-6">
            <AuthForm action={registerAction} submitLabel="Create account">
              <RoleToggle defaultRole={defaultRole} />
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Jane Doe" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="At least 6 characters" required minLength={6} />
              </div>
            </AuthForm>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
