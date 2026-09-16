import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visitorPings } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "").slice(0, 60);
    const path = String(body.path || "").slice(0, 300);
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 400 });

    const session = await getSession();

    await db.insert(visitorPings).values({
      sessionId,
      path,
      userId: session?.userId ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
