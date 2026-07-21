"use client";
import { useEffect } from "react";
export function ServiceWorkerRegister(){
  useEffect(()=>{
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then(registration => {
      registration.update().catch(()=>undefined);
      const timer = window.setInterval(() => registration.update().catch(()=>undefined), 60 * 60 * 1000);
      return () => window.clearInterval(timer);
    }).catch(()=>undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  },[]);
  return null;
}
