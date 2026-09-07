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
    let authenticated = false;
    let hydrated = false;
    let saving = false;
    let savePending = false;

    async function saveCloud() {
      if (disposed || !authenticated || !hydrated) return;
      if (saving) {
        savePending = true;
        return;
      }

      saving = true;
      try {
        do {
          savePending = false;
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
            break;
          }
          emit({ status: "synced", updatedAt: data.updatedAt ?? new Date().toISOString() });
        } while (savePending && !disposed);
      } catch {
        emit({ status: "error", message: "Cloud-Synchronisierung fehlgeschlagen." });
      } finally {
        saving = false;
      }
    }

    function checkpoint() {
      void saveCloud();
    }

    function visibilityCheckpoint() {
      if (document.visibilityState === "hidden") checkpoint();
    }

    async function bootstrap() {
      try {
        emit({ status: "syncing" });
        const account = await fetch("/api/account", { credentials: "same-origin", cache: "no-store" });
        if (!account.ok || disposed) {
          emit({ status: "idle" });
          return;
        }
        const accountData = await account.json() as { user?: { id?: string } };
        const userId = accountData.user?.id;
        if (!userId) {
          emit({ status: "idle" });
          return;
        }
        authenticated = true;

        const hydratedKey = `kogtrain-cloud-hydrated:${userId}`;
        const remote = await fetch("/api/player-state", { credentials: "same-origin", cache: "no-store" });
        if (!remote.ok || disposed) {
          const failure = await remote.json().catch(() => ({})) as { error?: string };
          emit({ status: "error", message: failure.error ?? "Cloud-Status konnte nicht geladen werden." });
          return;
        }
        const data = await remote.json() as { state?: PlayerCloudState | null; updatedAt?: string };

        // Remote-first hydration is deliberate: a freshly opened second device
        // must restore the authenticated account before any local empty/default
        // snapshot is allowed to overwrite the cloud state.
        if (data.state && !sessionStorage.getItem(hydratedKey)) {
          importPlayerState(data.state);
          sessionStorage.setItem(hydratedKey, "1");
          emit({ status: "synced", updatedAt: data.updatedAt });
          window.location.reload();
          return;
        }

        hydrated = true;
        sessionStorage.setItem(hydratedKey, "1");
        if (!data.state) await saveCloud();
        else emit({ status: "synced", updatedAt: data.updatedAt });

        interval = window.setInterval(checkpoint, 10_000);
        window.addEventListener("pagehide", checkpoint);
        document.addEventListener("visibilitychange", visibilityCheckpoint);
        window.addEventListener("online", checkpoint);
      } catch {
        emit({ status: "error", message: "Cloud-Status konnte nicht geladen werden." });
      }
    }

    void bootstrap();
    return () => {
      if (hydrated && authenticated) checkpoint();
      disposed = true;
      if (interval) window.clearInterval(interval);
      window.removeEventListener("pagehide", checkpoint);
      document.removeEventListener("visibilitychange", visibilityCheckpoint);
      window.removeEventListener("online", checkpoint);
    };
  }, []);

  return null;
}
