"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ProgressCoachDashboard = dynamic(
  () => import("./ProgressCoachDashboard").then((mod) => mod.ProgressCoachDashboard),
  { ssr: false }
);

export function DeferredProgressCoachDashboard() {
  const markerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={markerRef} className="deferredProgressMount">
      {shouldLoad ? <ProgressCoachDashboard /> : <div id="fortschritt" className="deferredProgressAnchor" aria-hidden="true" />}
    </div>
  );
}
