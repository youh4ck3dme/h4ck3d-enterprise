import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import { generateBuilderDraft } from "./builder-component-generator";
import {
  buildWordPressThemeFiles,
  buildWordPressThemeZip,
  WORDPRESS_THEME_SLUG,
} from "./wordpress-theme-zip";

function validDraft() {
  return generateBuilderDraft({
    projectPrompt: "Landing page pre PWA kaviareň",
    audiencePrompt: "Lokálne kaviarne",
    sectionPrompt: "hero, feature grid, FAQ, CTA",
    stylePrompt: "WordPress-safe FSE theme",
  });
}

describe("WordPress FSE theme ZIP export", () => {
  it("builds the required WordPress theme file structure", () => {
    const files = buildWordPressThemeFiles(validDraft());

    expect(Object.keys(files).sort()).toEqual(
      [
        `${WORDPRESS_THEME_SLUG}/README.md`,
        `${WORDPRESS_THEME_SLUG}/parts/features.html`,
        `${WORDPRESS_THEME_SLUG}/parts/footer.html`,
        `${WORDPRESS_THEME_SLUG}/parts/header.html`,
        `${WORDPRESS_THEME_SLUG}/style.css`,
        `${WORDPRESS_THEME_SLUG}/templates/index.html`,
        `${WORDPRESS_THEME_SLUG}/theme.json`,
      ].sort(),
    );
    expect(files[`${WORDPRESS_THEME_SLUG}/style.css`]).toContain("Theme Name: Atomic Builder Export");
    expect(files[`${WORDPRESS_THEME_SLUG}/style.css`]).toContain(".gb-wp-card");
    expect(files[`${WORDPRESS_THEME_SLUG}/templates/index.html`]).toContain('"slug":"header"');
  });

  it("does not include forbidden active content in generated theme parts", () => {
    const files = buildWordPressThemeFiles(validDraft());
    const combined = Object.values(files).join("\n").toLowerCase();

    expect(combined).not.toContain("<script");
    expect(combined).not.toContain("<iframe");
    expect(combined).not.toContain("javascript:");
  });

  it("creates a readable zip archive", async () => {
    const blob = await buildWordPressThemeZip(validDraft());
    const zip = await JSZip.loadAsync(blob);

    expect(zip.file(`${WORDPRESS_THEME_SLUG}/style.css`)).toBeTruthy();
    expect(zip.file(`${WORDPRESS_THEME_SLUG}/theme.json`)).toBeTruthy();
    expect(zip.file(`${WORDPRESS_THEME_SLUG}/templates/index.html`)).toBeTruthy();
  });
});
