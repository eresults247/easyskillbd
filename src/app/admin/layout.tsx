import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell, NavGroup } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, Users, BookCheck, Wallet } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  const navGroups: NavGroup[] = [
    {
      title: "Control Center",
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Courses", href: "/admin/courses", icon: BookCheck },
        { label: "Payments", href: "/admin/payments", icon: Wallet },
      ],
    },
  ];

  return (
    <DashboardShell
      navGroups={navGroups}
      roleLabel="Admin"
      roleBadgeColor="bg-rose-500/20 text-rose-300"
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {children}
    </DashboardShell>
  );
}
