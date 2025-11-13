"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const swUrl = "/sw.js";
      navigator.serviceWorker
        .register(swUrl)
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);
  return null;
}
