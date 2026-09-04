"use client";

import { FormEvent, useEffect, useState } from "react";
import { exportActivePlayerState } from "@/lib/playerIdentity";

type User = { id: string; email: string; name: string };
type SyncState = "idle" | "syncing" | "synced" | "error";
type CloudSyncDetail = { status: SyncState; updatedAt?: string; message?: string };

function formatDate(value?: string | null) {
  if (!value) return "noch nicht gespeichert";
  try { return new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (response.ok) {
        const data = await response.json() as { user: User };
        setUser(data.user);
        setMessage("Cloud-Spielstand ist mit diesem Konto verknüpft.");
        const state = await fetch("/api/player-state", { cache: "no-store", credentials: "same-origin" });
        if (state.ok) {
          const cloud = await state.json() as { state?: unknown; updatedAt?: string };
          setSyncState(cloud.state ? "synced" : "idle");
          setUpdatedAt(cloud.updatedAt ?? null);
          setSyncMessage(cloud.state ? "Cloud-Spielstand ist synchronisiert." : "Noch kein Cloud-Spielstand vorhanden.");
        }
      } else if (response.status === 503) setMessage("Cloud-Datenbank ist noch nicht verbunden. Bitte zuerst DATABASE_URL und AUTH_SECRET in Vercel konfigurieren.");
      else setMessage("Noch nicht angemeldet.");
    }).catch(() => setMessage("Accountstatus konnte nicht geladen werden."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Wird verarbeitet …");
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: mode, name, email, password }),
      });
      const data = await response.json() as { user?: User; error?: string };
      if (!response.ok || !data.user) {
        setMessage(data.error ?? "Anmeldung fehlgeschlagen.");
        return;
      }
      setUser(data.user);
      setMessage("Angemeldet. Dein Spielstand wird jetzt geräteübergreifend synchronisiert.");
      sessionStorage.removeItem(`kogtrain-cloud-hydrated:${data.user.id}`);
      window.setTimeout(() => window.location.reload(), 500);
    } finally { setBusy(false); }
  }

  async function syncNow() {
    if (!user || busy) return;
    setBusy(true);
    setSyncState("syncing");
    setSyncMessage("Synchronisierung läuft …");
    try {
      const response = await fetch("/api/player-state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ state: exportActivePlayerState() }),
      });
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
    setMessage("Abgemeldet. Lokale Spielerprofile bleiben auf diesem Gerät erhalten.");
    setBusy(false);
  }

  if (user) {
    const dot = syncState === "synced" ? "#198754" : syncState === "syncing" ? "#d28a00" : syncState === "error" ? "#c53a3a" : "#6d7d86";
    return <section style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      <div>
        <p style={{ margin: 0, fontWeight: 900, color: "#087f82", textTransform: "uppercase", letterSpacing: ".08em" }}>Angemeldet</p>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", margin: ".5rem 0" }}>{user.name}</h2>
        <p style={{ margin: 0 }}>{user.email}</p>
      </div>
      <div style={{ padding: "1rem", border: "1px solid #d8e5e8", borderRadius: 16, background: "#f8fbfc" }} aria-live="polite">
        <div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap" }}>
          <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: "50%", background: dot, boxShadow: `0 0 0 4px ${dot}20` }} />
          <strong>{syncState === "synced" ? "Cloud synchronisiert" : syncState === "syncing" ? "Synchronisierung läuft" : syncState === "error" ? "Cloud-Fehler" : "Cloud bereit"}</strong>
        </div>
        <p style={{ margin: ".55rem 0 .2rem" }}>{syncMessage}</p>
        <small style={{ color: "#526875" }}>Letzte Cloud-Speicherung: {formatDate(updatedAt)}</small>
      </div>
      <p style={{ margin: 0 }}>{message}</p>
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
        <button type="button" onClick={syncNow} disabled={busy} style={{ minHeight: 48, padding: ".75rem 1.25rem", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white", fontWeight: 900 }}>{syncState === "syncing" ? "Speichert …" : "Jetzt synchronisieren"}</button>
        <button type="button" onClick={logout} disabled={busy} style={{ minHeight: 48, padding: ".75rem 1.25rem", borderRadius: 12, border: "1px solid #0b9296", background: "white", fontWeight: 800 }}>Abmelden</button>
      </div>
    </section>;
  }

  return <section style={{ display: "grid", gap: "1.25rem" }}>
    <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
      <button type="button" onClick={() => setMode("register")} aria-pressed={mode === "register"}>Konto erstellen</button>
      <button type="button" onClick={() => setMode("login")} aria-pressed={mode === "login"}>Anmelden</button>
    </div>
    <form onSubmit={submit} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff", display: "grid", gap: "1rem" }}>
      {mode === "register" && <label>Spielername<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} style={{ display: "block", width: "100%", minHeight: 48, marginTop: 6 }} /></label>}
      <label>E-Mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={{ display: "block", width: "100%", minHeight: 48, marginTop: 6 }} /></label>
      <label>Passwort<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete={mode === "register" ? "new-password" : "current-password"} style={{ display: "block", width: "100%", minHeight: 48, marginTop: 6 }} /></label>
      <button type="submit" disabled={busy} style={{ minHeight: 50, border: 0, borderRadius: 12, background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white", fontWeight: 900 }}>{busy ? "Bitte warten …" : mode === "register" ? "Konto erstellen" : "Anmelden"}</button>
      <p aria-live="polite" style={{ margin: 0 }}>{message}</p>
    </form>
  </section>;
}
