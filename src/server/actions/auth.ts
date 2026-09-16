"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export type AuthResult = { error?: string; success?: boolean };

export async function registerAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "student") as "student" | "instructor";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const status = role === "instructor" ? "pending" : "active";

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role, status })
    .returning();

  if (role === "instructor") {
    await setSessionCookie({ userId: user.id, role: user.role, email: user.email, name: user.name });
    redirect("/instructor?pending=1");
  }

  await setSessionCookie({ userId: user.id, role: user.role, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  if (user.status === "suspended") {
    return { error: "Your account has been suspended. Contact support." };
  }

  await setSessionCookie({ userId: user.id, role: user.role, email: user.email, name: user.name });

  if (user.role === "admin") redirect("/admin");
  if (user.role === "instructor") redirect("/instructor");
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
