import type { BuilderGenerationResult } from "./builder-component-generator";

export const WORDPRESS_THEME_SLUG = "atomic-builder-export";

export type WordPressThemeFileMap = Record<string, string>;

function wrapWordPressHtmlBlock(html: string): string {
  return `<!-- wp:html -->\n${html.trim()}\n<!-- /wp:html -->`;
}

function styleCss(cssManifest: string): string {
  return `/*
Theme Name: Atomic Builder Export
Theme URI: https://localhost/builder
Author: One-Man Show Builder
Description: Token-driven WordPress FSE theme generated from the builder workflow.
Version: 1.0.0
Requires at least: 6.4
Tested up to: 6.6
Requires PHP: 8.1
Text Domain: atomic-builder-export
*/

${cssManifest.trim()}
`;
}

function templateIndex(themeSlug: string): string {
  return [
    `<!-- wp:template-part {"slug":"header","theme":"${themeSlug}","tagName":"header"} /-->`,
    `<!-- wp:template-part {"slug":"features","theme":"${themeSlug}","tagName":"main"} /-->`,
    `<!-- wp:template-part {"slug":"footer","theme":"${themeSlug}","tagName":"footer"} /-->`,
    "",
  ].join("\n");
}

export function buildWordPressThemeFiles(result: BuilderGenerationResult): WordPressThemeFileMap {
  if (!result.valid) {
    throw new Error("WordPress ZIP export vyžaduje validný builder výstup.");
  }

  const partials = result.outputs.partials;
  const header = partials["Header.html"] || result.outputs.wordpressHtml;
  const features = partials["Features.html"] || result.outputs.wordpressHtml;
  const footer = partials["Footer.html"] || result.outputs.wordpressHtml;

  return {
    [`${WORDPRESS_THEME_SLUG}/style.css`]: styleCss(result.outputs.cssManifest),
    [`${WORDPRESS_THEME_SLUG}/theme.json`]: result.outputs.wordpressThemeJson,
    [`${WORDPRESS_THEME_SLUG}/templates/index.html`]: templateIndex(WORDPRESS_THEME_SLUG),
    [`${WORDPRESS_THEME_SLUG}/parts/header.html`]: wrapWordPressHtmlBlock(header),
    [`${WORDPRESS_THEME_SLUG}/parts/features.html`]: wrapWordPressHtmlBlock(features),
    [`${WORDPRESS_THEME_SLUG}/parts/footer.html`]: wrapWordPressHtmlBlock(footer),
    [`${WORDPRESS_THEME_SLUG}/README.md`]: [
      "# Atomic Builder Export",
      "",
      "Generated WordPress Full Site Editing theme package.",
      "",
      "Install:",
      "1. Upload this ZIP in WordPress Admin -> Appearance -> Themes -> Add New -> Upload Theme.",
      "2. Activate the theme.",
      "3. Review generated parts under Site Editor before production use.",
      "",
      "Safety:",
      "- No script tags.",
      "- No iframe tags.",
      "- No forms or inputs.",
      "- Styling is token-driven through style.css and theme.json.",
      "",
    ].join("\n"),
  };
}

export async function buildWordPressThemeZip(result: BuilderGenerationResult): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const files = buildWordPressThemeFiles(result);

  for (const [filePath, content] of Object.entries(files)) {
    zip.file(filePath, content);
  }

  const archive = await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  return new Blob([archive], { type: "application/zip" });
}
