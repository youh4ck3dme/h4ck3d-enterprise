import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      files.push(...walk(path));
      continue;
    }
    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      if (path.endsWith(".test.ts") || path.endsWith(".test.tsx")) {
        continue;
      }
      files.push(path);
    }
  }
  return files;
}

describe("auth architecture guard", () => {
  it("does not import Firebase Auth SDK in active src auth flow", () => {
    const srcRoot = resolve(process.cwd(), "src");
    const files = walk(srcRoot);
    const forbidden = [
      "firebase/auth",
      "firebase/app",
      "GoogleAuthProvider",
      "GithubAuthProvider",
      "signInWithPopup",
      "signInWithRedirect"
    ];

    const hits: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (forbidden.some((needle) => content.includes(needle))) {
        hits.push(file);
      }
    }

    expect(hits).toEqual([]);
  });
});
