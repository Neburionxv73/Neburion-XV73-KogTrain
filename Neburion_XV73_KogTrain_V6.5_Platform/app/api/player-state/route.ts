import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";
import { ensureSchema, getSql } from "@/lib/server/db";

async function userIdFrom(request: NextRequest) {
  await ensureSchema();
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    const sql = getSql();
    const rows = await sql`select payload, updated_at from kogtrain_player_state where user_id = ${userId} limit 1`;
    if (!rows[0]) return NextResponse.json({ state: null });
    return NextResponse.json({ state: rows[0].payload, updatedAt: rows[0].updated_at });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message.includes("_NOT_CONFIGURED") ? "Cloud-Speicher ist noch nicht konfiguriert." : "Cloud-Spielstand konnte nicht geladen werden." }, { status: message.includes("_NOT_CONFIGURED") ? 503 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await userIdFrom(request);
    if (!userId) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    const body = await request.json() as { state?: unknown };
    const serialized = JSON.stringify(body.state ?? null);
    if (!body.state || serialized.length > 750_000) return NextResponse.json({ error: "Ungültiger oder zu großer Spielstand." }, { status: 400 });
    const sql = getSql();
    await sql`insert into kogtrain_player_state (user_id, payload, updated_at)
      values (${userId}, ${sql.json(body.state as Record<string, unknown>)}, now())
      on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`;
    return NextResponse.json({ saved: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: message.includes("_NOT_CONFIGURED") ? "Cloud-Speicher ist noch nicht konfiguriert." : "Cloud-Spielstand konnte nicht gespeichert werden." }, { status: message.includes("_NOT_CONFIGURED") ? 503 : 500 });
  }
}
