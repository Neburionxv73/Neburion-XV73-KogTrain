"use client";

import { useEffect } from "react";
import { exportActivePlayerState, importPlayerState, type PlayerCloudState } from "@/lib/playerIdentity";

export function CloudPlayerBridge() {
  useEffect(() => {
    let disposed = false;
    let interval = 0;

    async function saveCloud() {
      try {
        await fetch("/api/player-state", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ state: exportActivePlayerState() }),
          credentials: "same-origin",
          keepalive: true,
        });
      } catch {}
    }

    async function bootstrap() {
      try {
        const account = await fetch("/api/account", { credentials: "same-origin", cache: "no-store" });
        if (!account.ok || disposed) return;
        const accountData = await account.json() as { user?: { id?: string } };
        const userId = accountData.user?.id;
        if (!userId) return;

        const hydratedKey = `kogtrain-cloud-hydrated:${userId}`;
        const remote = await fetch("/api/player-state", { credentials: "same-origin", cache: "no-store" });
        if (!remote.ok || disposed) return;
        const data = await remote.json() as { state?: PlayerCloudState | null };
        if (data.state && !sessionStorage.getItem(hydratedKey)) {
          importPlayerState(data.state);
          sessionStorage.setItem(hydratedKey, "1");
          window.location.reload();
          return;
        }
        if (!data.state) await saveCloud();
        sessionStorage.setItem(hydratedKey, "1");
        interval = window.setInterval(saveCloud, 10_000);
        window.addEventListener("pagehide", saveCloud);
      } catch {}
    }

    bootstrap();
    return () => {
      disposed = true;
      if (interval) window.clearInterval(interval);
      window.removeEventListener("pagehide", saveCloud);
    };
  }, []);

  return null;
}
