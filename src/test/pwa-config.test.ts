import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("PWA configuration", () => {
  it("has installable manifest icons", () => {
    const manifestPath = resolve(process.cwd(), "public/site.webmanifest");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/android-chrome-192x192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/android-chrome-512x512.png", sizes: "512x512" }),
        expect.objectContaining({ src: "/android-chrome-maskable-192x192.png", purpose: "maskable" }),
        expect.objectContaining({ src: "/android-chrome-maskable-512x512.png", purpose: "maskable" }),
      ]),
    );
  });

  it("does not cache Supabase Edge Function responses in the service worker config", () => {
    const viteConfig = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8");

    expect(viteConfig).not.toContain("api-cache");
    expect(viteConfig).not.toContain("/functions\\\\/v1");
  });
});
