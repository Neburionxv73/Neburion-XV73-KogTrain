"use client";

import { useEffect } from "react";
import { exportActivePlayerState, importPlayerState, type PlayerCloudState } from "@/lib/playerIdentity";

type CloudSyncDetail = { status: "idle" | "syncing" | "synced" | "error"; updatedAt?: string; message?: string };

function emit(detail: CloudSyncDetail) {
  window.dispatchEvent(new CustomEvent<CloudSyncDetail>("kogtrain-cloud-sync", { detail }));
}

export function CloudPlayerBridge() {
  useEffect(() => {
    let disposed = false;
    let interval = 0;

    async function saveCloud() {
      try {
        emit({ status: "syncing" });
        const response = await fetch("/api/player-state", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ state: exportActivePlayerState() }),
          credentials: "same-origin",
          keepalive: true,
        });
        const data = await response.json().catch(() => ({})) as { updatedAt?: string; error?: string };
        if (!response.ok) {
          emit({ status: "error", message: data.error ?? "Cloud-Synchronisierung fehlgeschlagen." });
          return;
        }
        emit({ status: "synced", updatedAt: data.updatedAt ?? new Date().toISOString() });
      } catch {
        emit({ status: "error", message: "Cloud-Synchronisierung fehlgeschlagen." });
      }
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
        const data = await remote.json() as { state?: PlayerCloudState | null; updatedAt?: string };
        if (data.state && !sessionStorage.getItem(hydratedKey)) {
          importPlayerState(data.state);
          sessionStorage.setItem(hydratedKey, "1");
          emit({ status: "synced", updatedAt: data.updatedAt });
          window.location.reload();
          return;
        }
        if (!data.state) await saveCloud();
        else emit({ status: "synced", updatedAt: data.updatedAt });
        sessionStorage.setItem(hydratedKey, "1");
        interval = window.setInterval(saveCloud, 10_000);
        window.addEventListener("pagehide", saveCloud);
      } catch {
        emit({ status: "error", message: "Cloud-Status konnte nicht geladen werden." });
      }
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
