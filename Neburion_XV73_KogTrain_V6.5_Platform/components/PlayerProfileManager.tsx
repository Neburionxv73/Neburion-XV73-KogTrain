"use client";

import { FormEvent, useMemo, useState } from "react";
import { createAndActivatePlayer, getActivePlayer, getPlayers, switchActivePlayer } from "@/lib/playerIdentity";

const card = { padding: "clamp(1.25rem,3vw,1.75rem)", border: "1px solid #cbdde1", borderRadius: "22px", background: "#fff" } as const;
const button = { minHeight: "48px", padding: ".72rem 1.05rem", borderRadius: "12px", fontWeight: 900, cursor: "pointer" } as const;

export function PlayerProfileManager() {
  const [active, setActive] = useState(() => getActivePlayer());
  const [players, setPlayers] = useState(() => getPlayers());
  const [name, setName] = useState("");
  const orderedPlayers = useMemo(() => [...players].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [players]);
  function refresh() { setActive(getActivePlayer()); setPlayers(getPlayers()); }
  function createProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const clean = name.trim(); if (!clean) return; createAndActivatePlayer(clean); setName(""); refresh(); window.location.reload(); }
  function activate(playerId: string) { if (playerId === active.id) return; switchActivePlayer(playerId); refresh(); window.location.reload(); }

  return <section style={{ display: "grid", gap: "1.25rem" }}>
    <div style={{ ...card, background: "linear-gradient(135deg,#073c42,#0b555b)", color: "#ffffff", border: 0 }}>
      <p style={{ margin: 0, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "#b9f3ef", fontSize: ".78rem" }}>Aktiver Spielstand</p>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div><h2 style={{ margin: ".55rem 0 .35rem", fontSize: "clamp(2rem,5vw,3.4rem)", lineHeight: 1, color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,.18)" }}>{active.name}</h2><p style={{ margin: 0, color: "#ffffff" }}>Dieses Profil ist aktuell für alle Trainingsbereiche aktiv.</p></div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".55rem .8rem", borderRadius: 999, background: "rgba(255,255,255,.12)", color: "#ffffff", fontWeight: 800 }}><i aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: "#57d9a8" }} /> Aktiv</span>
      </div>
      <p style={{ margin: "1rem 0 0", color: "#d8eeee", fontSize: ".9rem" }}>Profil-ID: <code style={{ color: "#ffffff", fontWeight: 800 }}>{active.id}</code></p>
    </div>

    <div style={card}>
      <div style={{ marginBottom: "1.2rem" }}><p style={{ margin: 0, color: "#087f82", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".09em", fontSize: ".78rem" }}>Profilwechsel</p><h2 style={{ margin: ".35rem 0 0", fontSize: "clamp(1.7rem,4vw,2.6rem)", color: "#14333b" }}>Spielerprofile</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,240px), 1fr))", gap: ".85rem" }}>
        {orderedPlayers.map((player) => { const selected = player.id === active.id; return <article key={player.id} style={{ padding: "1.15rem", border: selected ? "2px solid #0b9296" : "1px solid #d4e2e5", borderRadius: "18px", background: selected ? "#effcf9" : "#f9fbfc" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem" }}><strong style={{ fontSize: "1.15rem", color: "#14333b" }}>{player.name}</strong><span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: selected ? "#0b9296" : "#e5eef0", color: selected ? "white" : "#476168" }}>♙</span></div>
          <small style={{ display: "block", marginTop: ".35rem", color: "#526979" }}>{selected ? "Aktiver Spielstand" : "Separater Lernstand"}</small>
          <button type="button" disabled={selected} onClick={() => activate(player.id)} style={{ ...button, width: "100%", marginTop: "1rem", border: selected ? "1px solid #c4d8da" : 0, background: selected ? "#e7f2f2" : "#0b9296", color: selected ? "#476168" : "white", cursor: selected ? "default" : "pointer" }}>{selected ? "Aktiv" : "Profil laden"}</button>
        </article>; })}
      </div>
    </div>

    <form onSubmit={createProfile} style={{ ...card, background: "#f8fbfc" }}>
      <p style={{ margin: 0, color: "#087f82", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".09em", fontSize: ".78rem" }}>Neuer Lernstand</p>
      <h2 style={{ margin: ".35rem 0 .5rem", fontSize: "clamp(1.7rem,4vw,2.5rem)", color: "#14333b" }}>Spielerprofil erstellen</h2>
      <p style={{ margin: "0 0 1rem", color: "#526979", lineHeight: 1.6 }}>Das neue Profil beginnt leer. Dein bisheriger Trainingsstand bleibt vollständig im aktuellen Profil erhalten.</p>
      <label htmlFor="player-name" style={{ display: "block", fontWeight: 900, marginBottom: ".5rem", color: "#14333b" }}>Spielername</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="z. B. Anna" autoComplete="off" required style={{ flex: "1 1 220px", minWidth: 0, minHeight: "48px", padding: ".75rem 1rem", border: "1px solid #9ebbc0", borderRadius: "12px", font: "inherit", background: "white", color: "#14333b" }} /><button type="submit" style={{ ...button, flex: "0 1 auto", border: 0, background: "linear-gradient(135deg,#0b9296,#416fda)", color: "white" }}>Profil erstellen</button></div>
    </form>
  </section>;
}
