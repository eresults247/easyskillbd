"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("lms_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("lms_visitor_id", id);
  }
  return id;
}

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();
    const ping = () => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, path: pathname }),
        keepalive: true,
      }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 45_000);
    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
