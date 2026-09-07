"use client";

import { FormEvent, useEffect, useState } from "react";
import { createAndActivatePlayer, exportActivePlayerState } from "@/lib/playerIdentity";

type User = { id: string; email?: string | null; loginName: string; name: string };
type SyncState = "idle" | "syncing" | "synced" | "error";
type CloudSyncDetail = { status: SyncState; updatedAt?: string; message?: string };
type Mode = "register" | "login" | "recover" | "local";

function formatDate(value?: string | null) {
  if (!value) return "noch nicht gespeichert";
  try { return new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

const buttonStyle = { minHeight: 48, padding: ".75rem 1.1rem", borderRadius: 12, border: "1px solid #0b9296", background: "white", fontWeight: 800 } as const;
const inputStyle = { display: "block", width: "100%", minHeight: 48, marginTop: 6, padding: ".65rem .8rem", border: "1px solid #9ebbc0", borderRadius: 12, font: "inherit" } as const;

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("local");
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [issuedRecoveryCode, setIssuedRecoveryCode] = useState("");
  const [message, setMessage] = useState("Accountstatus wird geprüft …");
  const [busy, setBusy] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState("Cloud-Status wird geprüft …");

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<CloudSyncDetail>).detail;
      if (!detail) return;
      setSyncState(detail.status);
      if (detail.updatedAt) setUpdatedAt(detail.updatedAt);
      setSyncMessage(detail.message ?? (detail.status === "syncing" ? "Synchronisierung läuft …" : detail.status === "synced" ? "Cloud-Spielstand ist synchronisiert." : detail.status === "error" ? "Cloud-Synchronisierung fehlgeschlagen." : "Cloud bereit."));
    };
    window.addEventListener("kogtrain-cloud-sync", onSync);
    return () => window.removeEventListener("kogtrain-cloud-sync", onSync);
  }, []);

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" }).then(async (response) => {
      const data = await response.json().catch(() => ({})) as { user?: User; cloudConfigured?: boolean };
      if (response.ok && data.user) {
        setUser(data.user);
        setMessage("Cloud-Spielstand ist mit diesem Konto verknüpft.");
        const state = await fetch("/api/player-state", { cache: "no-store", credentials: "same-origin" });
        if (state.ok) {
          const cloud = await state.json() as { state?: unknown; updatedAt?: string };
          setSyncState(cloud.state ? "synced" : "idle");
          setUpdatedAt(cloud.updatedAt ?? null);
          setSyncMessage(cloud.state ? "Cloud-Spielstand ist synchronisiert." : "Noch kein Cloud-Spielstand vorhanden.");
        }
      } else setMessage(data.cloudConfigured === false ? "Cloud ist derzeit nicht verfügbar. Ein privates lokales Spielerprofil funktioniert trotzdem ohne E-Mail." : "Noch nicht mit einem Cloud-Konto angemeldet.");
    }).catch(() => setMessage("Accountstatus konnte nicht geladen werden."));
  }, []);

  async function submitCloud(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setIssuedRecoveryCode("");
    setMessage("Wird verarbeitet …");
    try {
      const payload = mode === "register"
        ? { action: "register", name, loginName, email, password }
        : mode === "recover"
          ? { action: "recover", identifier: loginName, recoveryCode, newPassword }
          : { action: "login", identifier: loginName, password };
      const response = await fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { user?: User; error?: string; recoveryCode?: string; recovered?: boolean };
      if (!response.ok) {
        setMessage(data.error ?? "Vorgang fehlgeschlagen.");
        return;
      }
      if (mode === "recover" && data.recovered) {
        setMode("login");
        setPassword("");
        setNewPassword("");
        setRecoveryCode("");
        setMessage("Passwort geändert. Du kannst dich jetzt mit deinem Kontonamen anmelden.");
        return;
      }
      if (!data.user) {
        setMessage("Anmeldung fehlgeschlagen.");
        return;
      }
      setUser(data.user);
      if (data.recoveryCode) {
        setIssuedRecoveryCode(data.recoveryCode);
        setMessage("Konto erstellt. Speichere den Wiederherstellungscode sicher – er ersetzt die Pflicht zur E-Mail-Adresse.");
      } else setMessage("Angemeldet. Dein Spielstand wird jetzt geräteübergreifend synchronisiert.");
      sessionStorage.removeItem(`kogtrain-cloud-hydrated:${data.user.id}`);
      if (!data.recoveryCode) window.setTimeout(() => window.location.reload(), 500);
    } finally { setBusy(false); }
  }

  function createLocal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setMessage("Bitte einen Spielernamen eingeben.");
      return;
    }
    createAndActivatePlayer(clean);
    setMessage("Privates Spielerprofil erstellt. Es werden keine E-Mail-Adresse und kein Cloud-Konto benötigt.");
    window.setTimeout(() => window.location.assign("/"), 350);
  }

  async function syncNow() {
    if (!user || busy) return;
    setBusy(true);
    setSyncState("syncing");
    setSyncMessage("Synchronisierung läuft …");
    try {
      const response = await fetch("/api/player-state", { method: "PUT", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ state: exportActivePlayerState() }) });
      const data = await response.json() as { updatedAt?: string; error?: string };
      if (!response.ok) {
        setSyncState("error");
        setSyncMessage(data.error ?? "Cloud-Synchronisierung fehlgeschlagen.");
        return;
      }
      setSyncState("synced");
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
      setSyncMessage("Cloud-Spielstand wurde manuell gespeichert.");
    } catch {
      setSyncState("error");
      setSyncMessage("Cloud-Synchronisierung fehlgeschlagen.");
    } finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    await fetch("/api/account", { method: "DELETE" });
    setUser(null);
    setSyncState("idle");
    setUpdatedAt(null);
    setMode("local");
    setMessage("Abgemeldet. Lokale Spielerprofile bleiben auf diesem Gerät erhalten.");
    setBusy(false);
  }

  if (user) {
    const dot = syncState === "synced" ? "#198754" : syncState === "syncing" ? "#d28a00" : syncState === "error" ? "#c53a3a" : "#6d7d86";
    return <section style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      <div>
        <p style={{ margin: 0, fontWeight: 900, color: "#087f82", textTransform: "uppercase", letterSpacing: ".08em" }}>Angemeldet</p>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", margin: ".5rem 0" }}>{user.name}</h2>
        <p style={{ margin: 0 }}>Kontoname: <strong>{user.loginName}</strong>{user.email ? ` · ${user.email}` : " · ohne E-Mail"}</p>
      </div>
      {issuedRecoveryCode && <div style={{ padding: "1rem", border: "2px solid #0b9296", borderRadius: 16, background: "#effcf9" }}>
        <strong>Wiederherstellungscode</strong>
        <code style={{ display: "block", marginTop: 8, fontSize: "1.1rem", wordBreak: "break-all" }}>{issuedRecoveryCode}</code>
        <p style={{ marginBottom: 0 }}>Diesen Code jetzt sicher notieren. Er wird nicht erneut im Klartext angezeigt.</p>
      </div>}
      <div style={{ padding: "1rem", border: "1px solid #d8e5e8", borderRadius: 16, background: "#f8fbfc" }} aria-live="polite">
        <div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap" }}><span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: "50%", background: dot, boxShadow: `0 0 0 4px ${dot}20` }} /><strong>{syncState === "synced" ? "Cloud synchronisiert" : syncState === "syncing" ? "Synchronisierung läuft" : syncState === "error" ? "Cloud-Fehler" : "Cloud bereit"}</strong></div>
        <p style={{ margin: ".55rem 0 .2rem" }}>{syncMessage}</p>
        <small style={{ color: "#526875" }}>Letzte Cloud-Speicherung: {formatDate(updatedAt)}</small>
      </div>
      <p style={{ margin: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
        <button type="button" onClick={syncNow} disabled={busy} style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>{syncState === "syncing" ? "Speichert …" : "Jetzt synchronisieren"}</button>
        <button type="button" onClick={logout} disabled={busy} style={buttonStyle}>Abmelden</button>
      </div>
    </section>;
  }

  return <section style={{ display: "grid", gap: "1.25rem" }}>
    <div style={{ padding: "1rem 1.25rem", borderRadius: 18, background: "#effcf9", border: "1px solid #b9e3dc" }}>
      <strong>Datenschutz zuerst:</strong> Du kannst die Lernplattform vollständig mit einem privaten Spielerprofil nutzen – ohne E-Mail-Adresse und ohne Cloud-Konto. Für geräteübergreifenden Sync reicht ebenfalls ein frei gewählter Kontoname; E-Mail ist optional.
    </div>
    <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
      <button type="button" onClick={() => setMode("local")} aria-pressed={mode === "local"} style={buttonStyle}>Ohne E-Mail starten</button>
      <button type="button" onClick={() => setMode("register")} aria-pressed={mode === "register"} style={buttonStyle}>Cloud-Konto erstellen</button>
      <button type="button" onClick={() => setMode("login")} aria-pressed={mode === "login"} style={buttonStyle}>Anmelden</button>
      <button type="button" onClick={() => setMode("recover")} aria-pressed={mode === "recover"} style={buttonStyle}>Passwort vergessen</button>
    </div>

    {mode === "local" ? <form onSubmit={createLocal} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      <h2 style={{ margin: 0, fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>Privates Spielerprofil</h2>
      <p style={{ margin: 0 }}>Nur ein Spielername wird auf diesem Gerät gespeichert. Keine E-Mail, kein Passwort, keine Registrierung.</p>
      <label>Spielername<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} autoComplete="off" style={inputStyle} /></label>
      <button type="submit" style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>Privates Profil erstellen</button>
      <p aria-live="polite" style={{ margin: 0 }}>{message}</p>
    </form> : <form onSubmit={submitCloud} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      {mode === "register" && <label>Spielername<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} style={inputStyle} /></label>}
      <label>{mode === "recover" ? "Kontoname oder E-Mail" : mode === "login" ? "Kontoname oder E-Mail" : "Kontoname"}<input value={loginName} onChange={(e) => setLoginName(e.target.value)} required minLength={3} maxLength={48} autoComplete="username" style={inputStyle} /></label>
      {mode === "register" && <label>E-Mail <small>(optional)</small><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} /></label>}
      {mode !== "recover" && <label>Passwort<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete={mode === "register" ? "new-password" : "current-password"} style={inputStyle} /></label>}
      {mode === "recover" && <><label>Wiederherstellungscode<input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} required autoComplete="off" style={inputStyle} /></label><label>Neues Passwort<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required autoComplete="new-password" style={inputStyle} /></label></>}
      <button type="submit" disabled={busy} style={{ ...buttonStyle, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white" }}>{busy ? "Bitte warten …" : mode === "register" ? "Cloud-Konto erstellen" : mode === "recover" ? "Passwort zurücksetzen" : "Anmelden"}</button>
      {mode === "register" && <p style={{ margin: 0, color: "#526875" }}>Nach der Erstellung erhältst du einen Wiederherstellungscode. Damit kannst du dein Passwort später auch ohne hinterlegte E-Mail ändern.</p>}
      <p aria-live="polite" style={{ margin: 0 }}>{message}</p>
    </form>}
  </section>;
}
