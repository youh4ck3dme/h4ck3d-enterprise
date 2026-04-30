#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_EXPORT_PATH = path.join(ROOT, "tmp", "atomic-builder-export.json");
const DEFAULT_TOKENS_PATH = path.join(ROOT, "src", "design", "design-tokens.json");
const DEFAULT_WP_THEME_PATH = path.join(
  "C:",
  "Users",
  "42195",
  "Desktop",
  "P R O J E  K  T Y",
  "wp-content",
  "themes",
  "atomic-lab",
);

const SAFE_PARTIAL_NAMES = new Set(["Header.html", "Features.html", "Footer.html", "CTA.html"]);
const FORBIDDEN_HTML = [
  /<\s*script\b/i,
  /<\s*style\b/i,
  /<\s*iframe\b/i,
  /<\s*form\b/i,
  /<\s*input\b/i,
  /\son\w+\s*=/i,
  /javascript:/i,
];

function parseArgs(argv) {
  const args = {
    command: argv[2] ?? "help",
    exportPath: DEFAULT_EXPORT_PATH,
    tokensPath: DEFAULT_TOKENS_PATH,
    wpThemePath: process.env.WP_ATOMIC_THEME_PATH || DEFAULT_WP_THEME_PATH,
    dryRun: false,
    wpUrl: process.env.WP_ATOMIC_URL || "http://localhost:8080",
  };

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--export") {
      args.exportPath = path.resolve(argv[++index]);
      continue;
    }
    if (arg === "--tokens") {
      args.tokensPath = path.resolve(argv[++index]);
      continue;
    }
    if (arg === "--wp-theme") {
      args.wpThemePath = path.resolve(argv[++index]);
      continue;
    }
    if (arg === "--wp-url") {
      args.wpUrl = argv[++index];
      continue;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFileSafe(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`DRY_WRITE ${filePath} (${content.length} bytes)`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`WROTE ${filePath}`);
}

function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function assertSafeHtml(fileName, html) {
  if (!SAFE_PARTIAL_NAMES.has(fileName)) {
    throw new Error(`Unsafe partial file name: ${fileName}`);
  }
  for (const pattern of FORBIDDEN_HTML) {
    if (pattern.test(html)) {
      throw new Error(`Unsafe HTML in ${fileName}: ${pattern}`);
    }
  }
}

function buildPaletteFromTokens(tokens) {
  return Object.entries(tokens.colors).map(([slug, value]) => ({
    slug: kebabCase(slug),
    name: slug.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
    color: value.hex,
  }));
}

function buildSpacingFromTokens(tokens) {
  return Object.entries(tokens.spacing.scale).map(([slug, size]) => ({
    slug: kebabCase(slug),
    name: slug.toUpperCase(),
    size,
  }));
}

function buildFontSizesFromTokens(tokens) {
  return Object.entries(tokens.typography.scale).map(([slug, size]) => ({
    slug: kebabCase(slug),
    name: slug.toUpperCase(),
    size,
  }));
}

function syncThemeJson(args) {
  const tokens = readJson(args.tokensPath);
  const themePath = path.join(args.wpThemePath, "theme.json");
  const theme = readJson(themePath);

  theme.settings ??= {};
  theme.settings.color ??= {};
  theme.settings.spacing ??= {};
  theme.settings.typography ??= {};

  theme.settings.color.custom = false;
  theme.settings.color.defaultPalette = false;
  theme.settings.color.palette = buildPaletteFromTokens(tokens);

  theme.settings.spacing.customSpacingSize = false;
  theme.settings.spacing.defaultSpacingSizes = false;
  theme.settings.spacing.spacingSizes = buildSpacingFromTokens(tokens);
  theme.settings.spacing.units = ["rem", "px"];

  theme.settings.typography.customFontSize = false;
  theme.settings.typography.defaultFontSizes = false;
  theme.settings.typography.fluid = true;
  theme.settings.typography.fontSizes = buildFontSizesFromTokens(tokens);

  writeFileSafe(themePath, `${JSON.stringify(theme, null, 2)}\n`, args.dryRun);
  return {
    palette: theme.settings.color.palette.length,
    spacing: theme.settings.spacing.spacingSizes.length,
    fontSizes: theme.settings.typography.fontSizes.length,
  };
}

function publishParts(args) {
  const builderExport = readJson(args.exportPath);
  const partials = builderExport.outputs?.partials;
  if (!partials || typeof partials !== "object") {
    throw new Error(`Missing outputs.partials in ${args.exportPath}`);
  }

  const partsDir = path.join(args.wpThemePath, "parts");
  const written = [];

  for (const [fileName, html] of Object.entries(partials)) {
    assertSafeHtml(fileName, String(html));
    const target = path.join(partsDir, fileName.toLowerCase());
    writeFileSafe(target, String(html), args.dryRun);
    written.push(target);
  }

  const cssManifest = builderExport.outputs?.cssManifest;
  if (typeof cssManifest === "string" && cssManifest.trim().length > 0) {
    writeFileSafe(path.join(args.wpThemePath, "assets", "style-manifest.css"), cssManifest, args.dryRun);
    written.push(path.join(args.wpThemePath, "assets", "style-manifest.css"));
  }

  return written;
}

function generateSampleExport(args) {
  const sample = {
    source: "bridge-sample",
    outputs: {
      partials: {
        "Header.html": "<!-- Header.html generated from Master Style Schema. -->\n<section class=\"gb-wp-card gb-wp-bg-surface-raised gb-wp-border-ink gb-wp-p-md\"><h2 class=\"gb-wp-text-primary\">Atomic Header</h2><p class=\"gb-wp-text-muted\">Token-driven FSE partial.</p></section>",
        "Features.html": "<!-- Features.html generated from Master Style Schema. -->\n<section class=\"gb-wp-card gb-wp-bg-surface-raised gb-wp-border-ink gb-wp-p-md\"><h2 class=\"gb-wp-text-primary\">Atomic Features</h2><ul><li>Theme tokens</li><li>Safe HTML</li><li>Reusable partials</li></ul></section>",
        "Footer.html": "<!-- Footer.html generated from Master Style Schema. -->\n<section class=\"gb-wp-card gb-wp-bg-surface-raised gb-wp-border-ink gb-wp-p-md\"><p class=\"gb-wp-text-muted\">Generated by Atomic Bridge.</p></section>"
      },
      cssManifest: ":root { --gb-primary: #e9252a; --gb-surface: #f4efe6; --gb-ink: #080808; }\n.gb-wp-card { border: 4px solid var(--gb-ink); }\n.gb-wp-text-primary { color: var(--gb-primary); }\n.gb-wp-bg-surface-raised { background: #fbf7ef; }\n.gb-wp-p-md { padding: 16px; }\n.gb-wp-text-muted { color: #71685e; }\n"
    }
  };

  writeFileSafe(args.exportPath, `${JSON.stringify(sample, null, 2)}\n`, args.dryRun);
  return args.exportPath;
}

async function smokeRest(args) {
  const home = await fetch(args.wpUrl);
  const themes = await fetch(`${args.wpUrl}/wp-json/wp/v2/themes`);
  const posts = await fetch(`${args.wpUrl}/wp-json/wp/v2/posts`);

  console.log(`WP_HOME_STATUS=${home.status}`);
  console.log(`WP_THEMES_STATUS=${themes.status}`);
  console.log(`WP_POSTS_STATUS=${posts.status}`);

  if (!home.ok || !themes.ok || !posts.ok) {
    throw new Error("WordPress REST smoke failed");
  }
}

function printHelp() {
  console.log(`Atomic WordPress Bridge

Usage:
  node tools/wp-atomic-bridge.mjs generate [--export path]
  node tools/wp-atomic-bridge.mjs sync-theme [--tokens path] [--wp-theme path] [--dry-run]
  node tools/wp-atomic-bridge.mjs publish-parts [--export path] [--wp-theme path] [--dry-run]
  node tools/wp-atomic-bridge.mjs smoke-rest [--wp-url http://localhost:8080]

Environment:
  WP_ATOMIC_THEME_PATH  Optional path to /wp-content/themes/atomic-lab
  WP_ATOMIC_URL         Optional WordPress URL for REST smoke
`);
}

const args = parseArgs(process.argv);

try {
  if (args.command === "generate") {
    console.log(`SAMPLE_EXPORT=${generateSampleExport(args)}`);
  } else if (args.command === "sync-theme") {
    const result = syncThemeJson(args);
    console.log(`SYNC_THEME=PASS palette=${result.palette} spacing=${result.spacing} fontSizes=${result.fontSizes}`);
  } else if (args.command === "publish-parts") {
    const written = publishParts(args);
    console.log(`PUBLISH_PARTS=PASS files=${written.length}`);
  } else if (args.command === "smoke-rest") {
    await smokeRest(args);
    console.log("SMOKE_REST=PASS");
  } else {
    printHelp();
  }
} catch (error) {
  console.error(`BRIDGE_FAIL=${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
