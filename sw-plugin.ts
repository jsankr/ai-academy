import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/** Public files the app needs offline. Built JS, CSS, fonts and images are added automatically. */
const STATIC = [
  "./",
  "./index.html",
  "./workbook.html",
  "./manifest.webmanifest",
  "./assets/academy-icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

/**
 * Emits dist/sw.js from sw/sw.js with the exact list of files in this build.
 * The cache version is a hash of that list plus the public files, so every
 * release replaces the previous cache and stale assets are deleted.
 */
export function offlineServiceWorker(root: string): Plugin {
  return {
    name: "ai-academy-offline-sw",
    apply: "build",
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle)
        .filter((f) => !f.endsWith(".map") && !f.endsWith(".woff") && f !== "index.html")
        .map((f) => "./" + f);
      const files = [...STATIC, ...built];
      const hash = createHash("sha256").update(files.join("\n"));
      for (const f of STATIC.slice(2)) {
        try {
          hash.update(readFileSync(path.join(root, "public", f)));
        } catch {
          /* optional file */
        }
      }
      const source = readFileSync(path.join(root, "sw", "sw.js"), "utf8")
        .replace("__VERSION__", hash.digest("hex").slice(0, 12))
        .replace("__PRECACHE__", JSON.stringify(files, null, 2));
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
