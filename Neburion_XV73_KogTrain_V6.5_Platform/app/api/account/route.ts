import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, hashPassword, sessionMaxAge, SESSION_COOKIE, verifyPassword, verifySessionToken } from "@/lib/server/auth";
import { ensureSchema, getSql } from "@/lib/server/db";

function cookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: sessionMaxAge };
}

function configurationError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("_NOT_CONFIGURED");
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!userId) return NextResponse.json({ authenticated: false, cloudConfigured: true });
    const sql = getSql();
    const rows = await sql`select id, email, display_name from kogtrain_users where id = ${userId} limit 1`;
    if (!rows[0]) return NextResponse.json({ authenticated: false, cloudConfigured: true });
    return NextResponse.json({ authenticated: true, cloudConfigured: true, user: { id: rows[0].id, email: rows[0].email, name: rows[0].display_name } });
  } catch (error) {
    if (configurationError(error)) {
      return NextResponse.json({ authenticated: false, cloudConfigured: false });
    }
    return NextResponse.json({ error: "Account konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json() as { action?: string; email?: string; password?: string; name?: string };
    const action = body.action === "register" ? "register" : "login";
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const name = (body.name ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return NextResponse.json({ error: "E-Mail prüfen und mindestens 8 Zeichen Passwort verwenden." }, { status: 400 });
    const sql = getSql();
    let user: { id: string; email: string; name: string };
    if (action === "register") {
      if (!name) return NextResponse.json({ error: "Bitte einen Spielernamen angeben." }, { status: 400 });
      const existing = await sql`select id from kogtrain_users where email = ${email} limit 1`;
      if (existing[0]) return NextResponse.json({ error: "Für diese E-Mail existiert bereits ein Konto." }, { status: 409 });
      const id = randomUUID();
      await sql`insert into kogtrain_users (id, email, display_name, password_hash) values (${id}, ${email}, ${name}, ${hashPassword(password)})`;
      user = { id, email, name };
    } else {
      const rows = await sql`select id, email, display_name, password_hash from kogtrain_users where email = ${email} limit 1`;
      const row = rows[0];
      if (!row || !verifyPassword(password, row.password_hash)) return NextResponse.json({ error: "E-Mail oder Passwort ist falsch." }, { status: 401 });
      user = { id: row.id, email: row.email, name: row.display_name };
    }
    const response = NextResponse.json({ authenticated: true, cloudConfigured: true, user });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), cookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ error: configurationError(error) ? "Cloud-Speicher ist noch nicht konfiguriert." : "Anmeldung konnte nicht abgeschlossen werden." }, { status: configurationError(error) ? 503 : 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
