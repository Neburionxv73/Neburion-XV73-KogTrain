"use client";

import { FormEvent, useMemo, useState } from "react";
import { createAndActivatePlayer, getActivePlayer, getPlayers, switchActivePlayer } from "@/lib/playerIdentity";

export function PlayerProfileManager() {
  const [active, setActive] = useState(() => getActivePlayer());
  const [players, setPlayers] = useState(() => getPlayers());
  const [name, setName] = useState("");

  const orderedPlayers = useMemo(() => [...players].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [players]);

  function refresh() {
    setActive(getActivePlayer());
    setPlayers(getPlayers());
  }

  function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    createAndActivatePlayer(clean);
    setName("");
    refresh();
    window.location.reload();
  }

  function activate(playerId: string) {
    if (playerId === active.id) return;
    switchActivePlayer(playerId);
    refresh();
    window.location.reload();
  }

  return (
    <section style={{ display: "grid", gap: "2rem" }}>
      <div style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: "24px", background: "#fff" }}>
        <p style={{ margin: 0, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#087f82" }}>Aktiver Spielstand</p>
        <h2 style={{ margin: ".5rem 0", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>{active.name}</h2>
        <p style={{ margin: 0, color: "#526979" }}>Profil-ID: <code>{active.id}</code></p>
        <p style={{ marginTop: ".75rem", maxWidth: "64ch" }}>XP, Level, Trainingsdaten, Skill-Werte und die Adaptive-Engine-Historie werden beim Profilwechsel getrennt gesichert.</p>
      </div>

      <div>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>Spielerprofile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {orderedPlayers.map((player) => {
            const selected = player.id === active.id;
            return (
              <article key={player.id} style={{ padding: "1.25rem", border: selected ? "2px solid #13b8b2" : "1px solid #cbdde1", borderRadius: "20px", background: selected ? "#effcf9" : "#fff" }}>
                <strong style={{ display: "block", fontSize: "1.25rem" }}>{player.name}</strong>
                <small style={{ color: "#526979" }}>{selected ? "Aktiver Spielstand" : "Eigener Spielstand"}</small>
                <button type="button" disabled={selected} onClick={() => activate(player.id)} style={{ display: "block", marginTop: "1rem", minHeight: "44px", padding: ".65rem 1rem", borderRadius: "12px", border: "1px solid #0aa9a4", background: selected ? "#e7f2f2" : "#0b9296", color: selected ? "#476168" : "white", fontWeight: 800, cursor: selected ? "default" : "pointer" }}>
                  {selected ? "Aktiv" : "Profil laden"}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <form onSubmit={createProfile} style={{ padding: "1.5rem", border: "1px solid #cbdde1", borderRadius: "24px", background: "#f7fbfc" }}>
        <h2 style={{ marginTop: 0 }}>Neues Spielerprofil</h2>
        <label htmlFor="player-name" style={{ display: "block", fontWeight: 800, marginBottom: ".5rem" }}>Spielername</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
          <input id="player-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="z. B. Anna" autoComplete="off" style={{ flex: "1 1 220px", minHeight: "48px", padding: ".75rem 1rem", border: "1px solid #9ebbc0", borderRadius: "12px", font: "inherit" }} />
          <button type="submit" style={{ minHeight: "48px", padding: ".75rem 1.25rem", border: 0, borderRadius: "12px", background: "linear-gradient(135deg,#12b8ad,#4b7ff2)", color: "white", fontWeight: 900, cursor: "pointer" }}>Profil erstellen</button>
        </div>
        <p style={{ marginBottom: 0, color: "#526979" }}>Ein neues Profil startet mit einem eigenen leeren Trainingsstand. Der bisherige Spielstand bleibt dem aktuellen Profil erhalten.</p>
      </form>
    </section>
  );
}
