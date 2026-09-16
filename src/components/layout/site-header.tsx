"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X, ShoppingCart } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const links = [
  { href: "/#courses", label: "Courses" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#become-instructor", label: "Teach on Skillio" },
];

export function SiteHeader({
  isAuthenticated,
  dashboardHref,
  cartCount = 0,
}: {
  isAuthenticated: boolean;
  dashboardHref: string;
  cartCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Skillio</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/cart" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <LinkButton href={dashboardHref} size="sm">
              Go to Dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/sign-in" variant="ghost" size="sm">
                Sign in
              </LinkButton>
              <LinkButton href="/sign-up" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 text-slate-700 lg:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {l.label}
                  </a>
                ))}
                <Link href="/cart" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cart ({cartCount})
                </Link>
              </div>
              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6">
                {isAuthenticated ? (
                  <LinkButton href={dashboardHref}>Go to Dashboard</LinkButton>
                ) : (
                  <>
                    <LinkButton href="/sign-in" variant="outline">
                      Sign in
                    </LinkButton>
                    <LinkButton href="/sign-up">Get started</LinkButton>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
