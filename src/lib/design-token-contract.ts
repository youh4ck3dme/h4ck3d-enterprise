import masterDesignTokens from "@/design/design-tokens.json";

type TokenColor = {
  hex: string;
  hsl: string;
  usage: string;
};

type MasterDesignTokens = typeof masterDesignTokens & {
  colors: Record<string, TokenColor>;
};

export const MASTER_DESIGN_TOKENS = masterDesignTokens as MasterDesignTokens;

export const ATOMIC_COMPONENT_PLAN = {
  atoms: ["button", "badge", "eyebrow", "heading", "text", "icon", "link"],
  molecules: ["hero", "feature-grid", "pricing-card", "faq-item", "cta-band", "testimonial-card"],
  organisms: ["landing-page", "builder-preview", "wordpress-section"],
};

function cssVarName(name: string): string {
  return `--gb-${name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
}

export function buildCssManifest(): string {
  const colorVars = Object.entries(MASTER_DESIGN_TOKENS.colors)
    .map(([name, value]) => `  ${cssVarName(name)}: ${value.hex};\n  ${cssVarName(name)}-hsl: ${value.hsl};`)
    .join("\n");

  const spacingVars = Object.entries(MASTER_DESIGN_TOKENS.spacing.scale)
    .map(([name, value]) => `  --gb-space-${name}: ${value};`)
    .join("\n");

  const typeVars = Object.entries(MASTER_DESIGN_TOKENS.typography.scale)
    .map(([name, value]) => `  --gb-text-${name}: ${value};`)
    .join("\n");

  return `:root {
${colorVars}
${spacingVars}
${typeVars}
  --gb-font-sans: ${MASTER_DESIGN_TOKENS.typography.fontFamily.sans};
  --gb-font-display: ${MASTER_DESIGN_TOKENS.typography.fontFamily.display};
  --gb-font-mono: ${MASTER_DESIGN_TOKENS.typography.fontFamily.mono};
}

.bg-surface { background: var(--gb-surface); }
.bg-surface-raised { background: var(--gb-surface-raised); }
.text-primary { color: var(--gb-primary); }
.text-muted { color: var(--gb-muted); }
.text-ink { color: var(--gb-ink); }
.border-ink { border-color: var(--gb-ink); }
.p-md { padding: var(--gb-space-md); }
.p-lg { padding: var(--gb-space-lg); }
.gap-md { gap: var(--gb-space-md); }
.gb-stack { display: grid; gap: var(--gb-space-md); }
.gb-card { background: var(--gb-surface-raised); border: 4px solid var(--gb-ink); padding: var(--gb-space-md); }
.gb-button { display: inline-flex; align-items: center; border: 4px solid var(--gb-ink); background: var(--gb-primary); color: white; padding: var(--gb-space-sm) var(--gb-space-md); font-weight: 900; text-transform: uppercase; text-decoration: none; }
.gb-wp-bg-surface { background: var(--gb-surface); }
.gb-wp-bg-surface-raised { background: var(--gb-surface-raised); }
.gb-wp-text-primary { color: var(--gb-primary); }
.gb-wp-text-muted { color: var(--gb-muted); }
.gb-wp-border-ink { border-color: var(--gb-ink); }
.gb-wp-p-md { padding: var(--gb-space-md); }
.gb-wp-card { background: var(--gb-surface-raised); border: 4px solid var(--gb-ink); padding: var(--gb-space-md); }`;
}

export function buildWordPressThemeJson(): string {
  const palette = Object.entries(MASTER_DESIGN_TOKENS.colors).map(([slug, value]) => ({
    slug,
    name: slug.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
    color: value.hex,
  }));

  const spacingSizes = Object.entries(MASTER_DESIGN_TOKENS.spacing.scale).map(([slug, size]) => ({
    slug,
    name: slug.toUpperCase(),
    size,
  }));

  const fontSizes = Object.entries(MASTER_DESIGN_TOKENS.typography.scale).map(([slug, size]) => ({
    slug,
    name: slug.toUpperCase(),
    size,
  }));

  return JSON.stringify(
    {
      $schema: "https://schemas.wp.org/trunk/theme.json",
      version: 3,
      settings: {
        color: {
          palette,
        },
        spacing: {
          spacingSizes,
          units: ["px", "rem", "%", "vw", "vh"],
        },
        typography: {
          fontFamilies: [
            {
              slug: "sans",
              name: "Sans",
              fontFamily: MASTER_DESIGN_TOKENS.typography.fontFamily.sans,
            },
            {
              slug: "mono",
              name: "Mono",
              fontFamily: MASTER_DESIGN_TOKENS.typography.fontFamily.mono,
            },
          ],
          fontSizes,
        },
      },
      styles: {
        color: {
          background: `var:preset|color|surface`,
          text: `var:preset|color|ink`,
        },
        typography: {
          fontFamily: `var:preset|font-family|sans`,
          fontSize: `var:preset|font-size|base`,
        },
      },
    },
    null,
    2,
  );
}

export function tokenContractWarning(): string {
  return "Master Style Schema active: komponenty používajú tokenové triedy, nie inline farby alebo pixelové štýly.";
}
