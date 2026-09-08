"use client";

import { FormEvent, useEffect, useState } from "react";
import { createAndActivatePlayer, exportActivePlayerState } from "@/lib/playerIdentity";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

type User = { id: string; loginName: string; name: string };
type SyncState = "idle" | "syncing" | "synced" | "error";
type CloudSyncDetail = { status: SyncState; updatedAt?: string; message?: string };
type Mode = "register" | "login" | "recover" | "local";

function formatDate(value: string | null | undefined, language: "de" | "en") {
  if (!value) return language === "en" ? "not saved yet" : "noch nicht gespeichert";
  try { return new Intl.DateTimeFormat(language === "en" ? "en-US" : "de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

const buttonStyle = { minHeight: 48, padding: ".75rem 1.1rem", borderRadius: 12, border: "1px solid #0b9296", background: "white", fontWeight: 800 } as const;
const inputStyle = { display: "block", width: "100%", minHeight: 48, marginTop: 6, padding: ".65rem .8rem", border: "1px solid #9ebbc0", borderRadius: 12, font: "inherit" } as const;

export function AccountPanel() {
  const { language, pick } = usePlatformLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("local");
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [issuedRecoveryCode, setIssuedRecoveryCode] = useState("");
  const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    setMessage(pick("Accountstatus wird geprüft …", "Checking account status …"));
    setSyncMessage(pick("Cloud-Status wird geprüft …", "Checking cloud status …"));
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<CloudSyncDetail>).detail;
      if (!detail) return;
      setSyncState(detail.status);
      if (detail.updatedAt) setUpdatedAt(detail.updatedAt);
      setSyncMessage(detail.message ?? (detail.status === "syncing" ? pick("Synchronisierung läuft …", "Sync in progress …") : detail.status === "synced" ? pick("Cloud-Spielstand ist synchronisiert.", "Cloud save is synced.") : detail.status === "error" ? pick("Cloud-Synchronisierung fehlgeschlagen.", "Cloud sync failed.") : pick("Cloud bereit.", "Cloud ready.")));
    };
    window.addEventListener("kogtrain-cloud-sync", onSync);
    return () => window.removeEventListener("kogtrain-cloud-sync", onSync);
  }, [language, pick]);

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" }).then(async (response) => {
      const data = await response.json().catch(() => ({})) as { user?: User; cloudConfigured?: boolean };
      if (response.ok && data.user) {
        setUser(data.user);
        setMessage(pick("Cloud-Spielstand ist mit diesem Konto verknüpft.", "Cloud save is linked to this account."));
        const state = await fetch("/api/player-state", { cache: "no-store", credentials: "same-origin" });
        if (state.ok) {
          const cloud = await state.json() as { state?: unknown; updatedAt?: string };
          setSyncState(cloud.state ? "synced" : "idle");
          setUpdatedAt(cloud.updatedAt ?? null);
          setSyncMessage(cloud.state ? pick("Cloud-Spielstand ist synchronisiert.", "Cloud save is synced.") : pick("Noch kein Cloud-Spielstand vorhanden.", "No cloud save exists yet."));
        }
      } else setMessage(data.cloudConfigured === false ? pick("Cloud ist derzeit nicht verfügbar. Ein privates lokales Spielerprofil funktioniert trotzdem.", "Cloud is currently unavailable. A private local player profile still works.") : pick("Noch nicht mit einem Cloud-Konto angemeldet.", "Not signed in to a cloud account yet."));
    }).catch(() => setMessage(pick("Accountstatus konnte nicht geladen werden.", "Account status could not be loaded.")));
  }, [language, pick]);

  async function submitCloud(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setIssuedRecoveryCode("");
    setRecoveryConfirmed(false);
    setMessage(pick("Wird verarbeitet …", "Processing …"));
    try {
      const payload = mode === "register"
        ? { action: "register", name, loginName, password }
        : mode === "recover"
          ? { action: "recover", identifier: loginName, recoveryCode, newPassword }
          : { action: "login", identifier: loginName, password };
      const response = await fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { user?: User; error?: string; recoveryCode?: string; recovered?: boolean };
      if (!response.ok) { setMessage(data.error ?? pick("Vorgang fehlgeschlagen.", "Action failed.")); return; }
      if (mode === "recover" && data.recovered) {
        setMode("login"); setPassword(""); setNewPassword(""); setRecoveryCode("");
        setMessage(pick("Passwort geändert. Du kannst dich jetzt mit deinem Kontonamen anmelden.", "Password changed. You can now sign in with your account name."));
        return;
      }
      if (!data.user) { setMessage(pick("Anmeldung fehlgeschlagen.", "Sign-in failed.")); return; }
      setUser(data.user);
      if (data.recoveryCode) {
        setIssuedRecoveryCode(data.recoveryCode);
        setMessage(pick("Konto erstellt. Bestätige zuerst, dass du den Wiederherstellungscode sicher gespeichert hast.", "Account created. First confirm that you have securely saved the recovery code."));
      } else {
        setRecoveryConfirmed(true);
        setMessage(pick("Angemeldet. Dein Spielstand wird jetzt geräteübergreifend synchronisiert.", "Signed in. Your progress will now sync across devices."));
        sessionStorage.removeItem(`kogtrain-cloud-hydrated:${data.user.id}`);
        window.setTimeout(() => window.location.reload(), 500);
      }
    } finally { setBusy(false); }
  }

  function confirmRecoveryCode() {
    if (!user || !issuedRecoveryCode) return;
    setRecoveryConfirmed(true);
    sessionStorage.removeItem(`kogtrain-cloud-hydrated:${user.id}`);
    setMessage(pick("Wiederherstellungscode bestätigt. Cloud-Synchronisierung ist jetzt freigegeben.", "Recovery code confirmed. Cloud sync is now enabled."));
    window.setTimeout(() => window.location.reload(), 500);
  }

  function createLocal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) { setMessage(pick("Bitte einen Spielernamen eingeben.", "Please enter a player name.")); return; }
    createAndActivatePlayer(clean);
    setMessage(pick("Privates Spielerprofil erstellt. Es wird kein Cloud-Konto benötigt.", "Private player profile created. No cloud account is required."));
    window.setTimeout(() => window.location.assign("/"), 350);
  }

  async function syncNow() {
    if (!user || busy || !recoveryConfirmed) return;
    setBusy(true); setSyncState("syncing"); setSyncMessage(pick("Synchronisierung läuft …", "Sync in progress …"));
    try {
      const response = await fetch("/api/player-state", { method: "PUT", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ state: exportActivePlayerState() }) });
      const data = await response.json() as { updatedAt?: string; error?: string };
      if (!response.ok) { setSyncState("error"); setSyncMessage(data.error ?? pick("Cloud-Synchronisierung fehlgeschlagen.", "Cloud sync failed.")); return; }
      setSyncState("synced"); setUpdatedAt(data.updatedAt ?? new Date().toISOString()); setSyncMessage(pick("Cloud-Spielstand wurde manuell gespeichert.", "Cloud save was stored manually."));
    } catch { setSyncState("error"); setSyncMessage(pick("Cloud-Synchronisierung fehlgeschlagen.", "Cloud sync failed.")); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); await fetch("/api/account", { method: "DELETE" });
    setUser(null); setSyncState("idle"); setUpdatedAt(null); setMode("local"); setRecoveryConfirmed(false); setIssuedRecoveryCode("");
    setMessage(pick("Abgemeldet. Lokale Spielerprofile bleiben auf diesem Gerät erhalten.", "Signed out. Local player profiles remain on this device.")); setBusy(false);
  }

  if (user) {
    const dot = syncState === "synced" ? "#198754" : syncState === "syncing" ? "#d28a00" : syncState === "error" ? "#c53a3a" : "#6d7d86";
    return <section style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      <div><p style={{ margin: 0, fontWeight: 900, color: "#087f82", textTransform: "uppercase", letterSpacing: ".08em" }}>{pick("Angemeldet", "Signed in")}</p><h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", margin: ".5rem 0" }}>{user.name}</h2><p style={{ margin: 0 }}>{pick("Kontoname", "Account name")}: <strong>{user.loginName}</strong></p></div>
      {issuedRecoveryCode && !recoveryConfirmed && <div style={{ padding: "1rem", border: "2px solid #0b9296", borderRadius: 16, background: "#effcf9" }}>
        <strong>{pick("Wiederherstellungscode jetzt sichern", "Save your recovery code now")}</strong><code style={{ display: "block", marginTop: 8, fontSize: "1.1rem", wordBreak: "break-all" }}>{issuedRecoveryCode}</code>
        <p>{pick("Dieser Code ist dein einziger Weg, ein vergessenes Passwort zurückzusetzen. Er wird später nicht erneut im Klartext angezeigt.", "This code is your only way to reset a forgotten password. It will not be shown again in plain text later.")}</p>
        <button type="button" onClick={confirmRecoveryCode} style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>{pick("Code sicher gespeichert – bestätigen", "Code saved safely — confirm")}</button>
      </div>}
      <div style={{ padding: "1rem", border: "1px solid #d8e5e8", borderRadius: 16, background: "#f8fbfc" }} aria-live="polite"><div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap" }}><span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: "50%", background: dot, boxShadow: `0 0 0 4px ${dot}20` }} /><strong>{syncState === "synced" ? pick("Cloud synchronisiert", "Cloud synced") : syncState === "syncing" ? pick("Synchronisierung läuft", "Sync in progress") : syncState === "error" ? pick("Cloud-Fehler", "Cloud error") : pick("Cloud bereit", "Cloud ready")}</strong></div><p style={{ margin: ".55rem 0 .2rem" }}>{issuedRecoveryCode && !recoveryConfirmed ? pick("Cloud-Sync startet nach Bestätigung des Recovery-Codes.", "Cloud sync starts after the recovery code is confirmed.") : syncMessage}</p><small style={{ color: "#526875" }}>{pick("Letzte Cloud-Speicherung", "Last cloud save")}: {formatDate(updatedAt, language)}</small></div>
      <p style={{ margin: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}><button type="button" onClick={syncNow} disabled={busy || !recoveryConfirmed} style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white", opacity: recoveryConfirmed ? 1 : .55 }}>{syncState === "syncing" ? pick("Speichert …", "Saving …") : pick("Jetzt synchronisieren", "Sync now")}</button><button type="button" onClick={logout} disabled={busy} style={buttonStyle}>{pick("Abmelden", "Sign out")}</button></div>
    </section>;
  }

  return <section style={{ display: "grid", gap: "1.25rem" }}>
    <div style={{ padding: "1rem 1.25rem", borderRadius: 18, background: "#effcf9", border: "1px solid #b9e3dc" }}><strong>{pick("Datenschutz zuerst:", "Privacy first:")}</strong> {pick("Die Plattform verwendet für Spielerzugänge keine E-Mail-Adressen. Du kannst lokal nur mit einem Spielernamen starten oder für Cloud-Sync einen Kontonamen mit Passwort anlegen.", "The platform does not use email addresses for player access. You can start locally with only a player name, or create an account name and password for cloud sync.")}</div>
    <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}><button type="button" onClick={() => setMode("local")} aria-pressed={mode === "local"} style={buttonStyle}>{pick("Privat starten", "Start privately")}</button><button type="button" onClick={() => setMode("register")} aria-pressed={mode === "register"} style={buttonStyle}>{pick("Cloud-Konto erstellen", "Create cloud account")}</button><button type="button" onClick={() => setMode("login")} aria-pressed={mode === "login"} style={buttonStyle}>{pick("Anmelden", "Sign in")}</button><button type="button" onClick={() => setMode("recover")} aria-pressed={mode === "recover"} style={buttonStyle}>{pick("Passwort vergessen", "Forgot password")}</button></div>
    {mode === "local" ? <form onSubmit={createLocal} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}><h2 style={{ margin: 0, fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>{pick("Privates Spielerprofil", "Private player profile")}</h2><p style={{ margin: 0 }}>{pick("Nur ein Spielername wird auf diesem Gerät gespeichert. Kein Passwort und keine Registrierung notwendig.", "Only a player name is stored on this device. No password or registration is required.")}</p><label>{pick("Spielername", "Player name")}<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} autoComplete="off" style={inputStyle} /></label><button type="submit" style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>{pick("Privates Profil erstellen", "Create private profile")}</button><p aria-live="polite" style={{ margin: 0 }}>{message}</p></form> : <form onSubmit={submitCloud} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      {mode === "register" && <label>{pick("Spielername", "Player name")}<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} style={inputStyle} /></label>}<label>{pick("Kontoname", "Account name")}<input value={loginName} onChange={(e) => setLoginName(e.target.value)} required minLength={3} maxLength={48} autoComplete="username" style={inputStyle} /></label>{mode !== "recover" && <label>{pick("Passwort", "Password")}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete={mode === "register" ? "new-password" : "current-password"} style={inputStyle} /></label>}{mode === "recover" && <><label>{pick("Wiederherstellungscode", "Recovery code")}<input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} required autoComplete="off" style={inputStyle} /></label><label>{pick("Neues Passwort", "New password")}<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required autoComplete="new-password" style={inputStyle} /></label></>}<button type="submit" disabled={busy} style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>{busy ? pick("Bitte warten …", "Please wait …") : mode === "register" ? pick("Cloud-Konto erstellen", "Create cloud account") : mode === "recover" ? pick("Passwort zurücksetzen", "Reset password") : pick("Anmelden", "Sign in")}</button>{mode === "register" && <p style={{ margin: 0, color: "#526875" }}>{pick("Nach der Erstellung musst du bestätigen, dass der einmalige Wiederherstellungscode sicher gespeichert wurde. Erst danach startet die Cloud-Synchronisierung.", "After creation, you must confirm that the one-time recovery code has been stored safely. Cloud sync starts only after that.")}</p>}<p aria-live="polite" style={{ margin: 0 }}>{message}</p>
    </form>}
  </section>;
}
