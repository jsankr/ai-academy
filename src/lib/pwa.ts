import { useEffect, useState } from "react";

const canUseSW = () =>
  "serviceWorker" in navigator &&
  (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname));

/**
 * Registers the offline service worker (production builds only).
 * Calls onUpdate when a newer version has downloaded; calling the given
 * function activates it and reloads the page.
 */
export function registerServiceWorker(onUpdate: (activate: () => void) => void) {
  if (!import.meta.env.PROD || !canUseSW()) return;
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  const start = async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      const offer = (w: ServiceWorker) => onUpdate(() => w.postMessage("SKIP_WAITING"));
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w?.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) offer(w);
        });
      });
    } catch {
      /* offline support unavailable in this browser context */
    }
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener("online", on);
    addEventListener("offline", off);
    return () => { removeEventListener("online", on); removeEventListener("offline", off); };
  }, []);
  return online;
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
  addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

/** Browser install prompt (Chrome, Edge, Android). Null where the browser offers no prompt. */
export function useInstallPrompt() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  const installed = typeof matchMedia !== "undefined" && matchMedia("(display-mode: standalone)").matches;
  return {
    installed,
    canInstall: !!deferred,
    install: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      listeners.forEach((l) => l());
      return outcome === "accepted";
    },
  };
}
