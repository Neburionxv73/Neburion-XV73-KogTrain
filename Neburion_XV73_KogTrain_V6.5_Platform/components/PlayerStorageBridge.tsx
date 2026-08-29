"use client";

import { useEffect } from "react";
import { getActivePlayer, migrateLegacyPlayerKeys, snapshotActivePlayerProgress } from "@/lib/playerIdentity";

export function PlayerStorageBridge() {
  useEffect(() => {
    const player = getActivePlayer();
    migrateLegacyPlayerKeys(player.id);
    snapshotActivePlayerProgress(player.id);

    const checkpoint = () => snapshotActivePlayerProgress(getActivePlayer().id);
    const interval = window.setInterval(checkpoint, 1500);
    window.addEventListener("pagehide", checkpoint);
    document.addEventListener("visibilitychange", checkpoint);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", checkpoint);
      document.removeEventListener("visibilitychange", checkpoint);
      checkpoint();
    };
  }, []);

  return null;
}
