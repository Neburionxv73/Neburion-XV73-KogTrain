import { randomBytes, randomUUID } from "node:crypto";
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

function cleanLoginName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function makeRecoveryCode() {
  return randomBytes(9).toString("base64url").match(/.{1,4}/g)?.join("-") ?? randomUUID();
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const userId = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!userId) return NextResponse.json({ authenticated: false, cloudConfigured: true });
    const sql = getSql();
    const rows = await sql`select id, email, login_name, display_name from kogtrain_users where id = ${userId} limit 1`;
    if (!rows[0]) return NextResponse.json({ authenticated: false, cloudConfigured: true });
    return NextResponse.json({ authenticated: true, cloudConfigured: true, user: { id: rows[0].id, email: rows[0].email, loginName: rows[0].login_name, name: rows[0].display_name } });
  } catch (error) {
    if (configurationError(error)) return NextResponse.json({ authenticated: false, cloudConfigured: false });
    return NextResponse.json({ error: "Account konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json() as { action?: string; email?: string; loginName?: string; identifier?: string; password?: string; name?: string; recoveryCode?: string; newPassword?: string };
    const action = body.action ?? "login";
    const email = (body.email ?? "").trim().toLowerCase();
    const loginName = cleanLoginName(body.loginName ?? "");
    const identifier = (body.identifier ?? body.email ?? body.loginName ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const name = (body.name ?? "").trim();
    const sql = getSql();

    if (action === "recover") {
      const recoveryCode = (body.recoveryCode ?? "").trim();
      const newPassword = body.newPassword ?? "";
      if (!identifier || recoveryCode.length < 8 || newPassword.length < 8) return NextResponse.json({ error: "Kontoname, Wiederherstellungscode und neues Passwort prüfen." }, { status: 400 });
      const rows = await sql`select id, recovery_code_hash from kogtrain_users where lower(coalesce(login_name, '')) = ${identifier} or lower(coalesce(email, '')) = ${identifier} limit 1`;
      const row = rows[0];
      if (!row?.recovery_code_hash || !verifyPassword(recoveryCode, row.recovery_code_hash)) return NextResponse.json({ error: "Wiederherstellungscode ist ungültig." }, { status: 401 });
      await sql`update kogtrain_users set password_hash = ${hashPassword(newPassword)} where id = ${row.id}`;
      return NextResponse.json({ recovered: true });
    }

    let user: { id: string; email: string | null; loginName: string; name: string };
    if (action === "register") {
      if (!name) return NextResponse.json({ error: "Bitte einen Spielernamen angeben." }, { status: 400 });
      if (loginName.length < 3) return NextResponse.json({ error: "Bitte einen Kontonamen mit mindestens 3 Zeichen wählen." }, { status: 400 });
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Die optionale E-Mail-Adresse ist ungültig." }, { status: 400 });
      if (password.length < 8) return NextResponse.json({ error: "Das Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
      const existing = await sql`select id from kogtrain_users where lower(coalesce(login_name, '')) = ${loginName} or (${email} <> '' and lower(coalesce(email, '')) = ${email}) limit 1`;
      if (existing[0]) return NextResponse.json({ error: "Dieser Kontoname oder diese E-Mail wird bereits verwendet." }, { status: 409 });
      const id = randomUUID();
      const recoveryCode = makeRecoveryCode();
      await sql`insert into kogtrain_users (id, email, login_name, display_name, password_hash, recovery_code_hash) values (${id}, ${email || null}, ${loginName}, ${name}, ${hashPassword(password)}, ${hashPassword(recoveryCode)})`;
      user = { id, email: email || null, loginName, name };
      const response = NextResponse.json({ authenticated: true, cloudConfigured: true, user, recoveryCode });
      response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), cookieOptions());
      return response;
    }

    if (!identifier || password.length < 8) return NextResponse.json({ error: "Kontoname/E-Mail und Passwort prüfen." }, { status: 400 });
    const rows = await sql`select id, email, login_name, display_name, password_hash from kogtrain_users where lower(coalesce(login_name, '')) = ${identifier} or lower(coalesce(email, '')) = ${identifier} limit 1`;
    const row = rows[0];
    if (!row || !verifyPassword(password, row.password_hash)) return NextResponse.json({ error: "Kontoname/E-Mail oder Passwort ist falsch." }, { status: 401 });
    user = { id: row.id, email: row.email, loginName: row.login_name ?? row.email, name: row.display_name };
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
