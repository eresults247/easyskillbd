import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/server/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : session.role === "instructor" ? "/instructor" : "/dashboard");
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue your learning journey.</p>

          <div className="mt-6">
            <AuthForm action={loginAction} submitLabel="Sign in">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
            </AuthForm>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Demo accounts (password: password123)</p>
          <p>Admin: admin@skillio.dev</p>
          <p>Instructor: sarah.instructor@skillio.dev</p>
          <p>Student: alex.student@skillio.dev</p>
        </div>
      </div>
    </div>
  );
}
