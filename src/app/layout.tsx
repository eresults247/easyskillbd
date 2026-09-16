import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { VisitorTracker } from "@/components/visitor-tracker";

export const metadata: Metadata = {
  title: "Skillio — Learn Without Limits",
  description: "A modern Learning Management System for students, instructors and admins.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <QueryProvider>
          <ToastProvider>
            <VisitorTracker />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
