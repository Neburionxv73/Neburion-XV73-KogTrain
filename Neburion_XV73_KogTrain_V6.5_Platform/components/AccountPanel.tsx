"use client";

import { FormEvent, useEffect, useState } from "react";

type User = { id: string; email: string; name: string };

export function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Accountstatus wird geprüft …");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account", { cache: "no-store" }).then(async (response) => {
      if (response.ok) {
        const data = await response.json() as { user: User };
        setUser(data.user);
        setMessage("Cloud-Spielstand ist mit diesem Konto verknüpft.");
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

  async function logout() {
    setBusy(true);
    await fetch("/api/account", { method: "DELETE" });
    setUser(null);
    setMessage("Abgemeldet. Lokale Spielerprofile bleiben auf diesem Gerät erhalten.");
    setBusy(false);
  }

  if (user) {
    return <section style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: 24, background: "#fff" }}>
      <p style={{ margin: 0, fontWeight: 900, color: "#087f82", textTransform: "uppercase", letterSpacing: ".08em" }}>Angemeldet</p>
      <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", margin: ".5rem 0" }}>{user.name}</h2>
      <p>{user.email}</p><p>{message}</p>
      <button type="button" onClick={logout} disabled={busy} style={{ minHeight: 48, padding: ".75rem 1.25rem", borderRadius: 12, border: "1px solid #0b9296", background: "white", fontWeight: 800 }}>Abmelden</button>
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
