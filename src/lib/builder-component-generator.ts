import { z } from "zod";

export const BUILDER_WORKFLOW_STORAGE_KEY = "builder-workflow:last-result";

export const SAFE_SECTION_TYPES = [
  "hero",
  "feature-grid",
  "benefits",
  "pricing",
  "faq",
  "cta",
  "testimonial",
  "checklist",
  "comparison-block",
] as const;

export const BuilderPromptInputSchema = z.object({
  projectPrompt: z.string().trim(),
  audiencePrompt: z.string().trim(),
  sectionPrompt: z.string().trim(),
  stylePrompt: z.string().trim(),
});

export type BuilderSectionType = (typeof SAFE_SECTION_TYPES)[number];

export const BuilderSectionSchema = z.object({
  type: z.enum(SAFE_SECTION_TYPES),
  headline: z.string().min(3),
  subheadline: z.string().min(10),
  primaryCta: z.string().optional(),
  secondaryCta: z.string().optional(),
  items: z.array(z.string()).optional(),
});

export type BuilderSection = z.infer<typeof BuilderSectionSchema>;

export const BuilderOutputSchema = z.object({
  title: z.string().min(3),
  target: z.enum(["react", "wordpress", "html"]),
  style: z.string().min(2),
  sections: z.array(BuilderSectionSchema).max(12),
  warnings: z.array(z.string()),
});

export type BuilderOutput = z.infer<typeof BuilderOutputSchema>;

export const BuilderGenerationResultSchema = z.object({
  valid: z.boolean(),
  source: z.literal("local-deterministic-draft"),
  status: z.enum([
    "ok",
    "missing-required-field",
    "rejected-due-to-danger",
    "invalid-output",
  ]),
  schema: BuilderOutputSchema,
  outputs: z.object({
    react: z.string(),
    tailwindReact: z.string(),
    html: z.string(),
    wordpressHtml: z.string(),
    json: z.string(),
  }),
  error: z.string().optional(),
});

export type BuilderGenerationResult = z.infer<typeof BuilderGenerationResultSchema>;

export interface BuilderPromptInput {
  projectPrompt: string;
  audiencePrompt: string;
  sectionPrompt: string;
  stylePrompt: string;
}

const REQUIRED_MIN_LENGTH = 3;
const WORDPRESS_CLASS_PREFIX = "gb-wp-";
const DANGEROUS_PATTERNS = [
  /\bshell\s*script\b/i,
  /\bdeploy\b/i,
  /\bcredential\b/i,
  /\bsteal\b/i,
  /\bexploit\b/i,
  /\bphish(?:ing)?\b/i,
  /\bmalware\b/i,
  /\bransomware\b/i,
  /\bbackdoor\b/i,
];

const FORBIDDEN_TAGS = ["script", "style", "iframe", "form", "input"];
const ALLOWED_WORDPRESS_TAGS = [
  "section",
  "div",
  "article",
  "header",
  "footer",
  "h2",
  "h3",
  "h4",
  "p",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "em",
  "details",
  "summary",
];

function sanitizePrompt(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isDangerousPrompt(input: BuilderPromptInput): boolean {
  const all = `${input.projectPrompt} ${input.audiencePrompt} ${input.sectionPrompt} ${input.stylePrompt}`.toLowerCase();
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(all));
}

export function validateBuilderPrompts(input: BuilderPromptInput): string[] {
  const projectPrompt = sanitizePrompt(input.projectPrompt);
  const audiencePrompt = sanitizePrompt(input.audiencePrompt);

  const errors: string[] = [];
  if (!projectPrompt || projectPrompt.length < REQUIRED_MIN_LENGTH) {
    errors.push("Prompt 1 (Čo ideš stavať?) je povinný.");
  }

  if (!audiencePrompt || audiencePrompt.length < REQUIRED_MIN_LENGTH) {
    errors.push("Prompt 2 (Pre koho to je?) je povinný.");
  }

  if (isDangerousPrompt(input)) {
    errors.push(
      "Nebezpečná požiadavka je zablokovaná. Presuň sa prosím na bezpečnejší, produktový prípad použitia.",
    );
  }

  return errors;
}

function splitSectionRequests(input: string): BuilderSectionType[] {
  const text = sanitizePrompt(input).toLowerCase();
  if (!text) {
    return ["hero", "feature-grid", "cta"];
  }

  const tokens = text
    .split(/[,;\n]/)
    .map((token) => token.trim())
    .filter(Boolean);

  const resolved: BuilderSectionType[] = [];
  for (const token of tokens) {
    if (token.includes("hero")) {
      resolved.push("hero");
      continue;
    }
    if (token.includes("feature")) {
      resolved.push("feature-grid");
      continue;
    }
    if (token.includes("benefit")) {
      resolved.push("benefits");
      continue;
    }
    if (token.includes("price")) {
      resolved.push("pricing");
      continue;
    }
    if (token.includes("faq")) {
      resolved.push("faq");
      continue;
    }
    if (token.includes("cta") || token.includes("call")) {
      resolved.push("cta");
      continue;
    }
    if (token.includes("testimonial") || token.includes("review")) {
      resolved.push("testimonial");
      continue;
    }
    if (token.includes("check")) {
      resolved.push("checklist");
      continue;
    }
    if (token.includes("comparison") || token.includes("compare")) {
      resolved.push("comparison-block");
      continue;
    }
  }

  if (!resolved.length) {
    return ["hero", "feature-grid", "cta"];
  }
  return Array.from(new Set(resolved)).slice(0, 8);
}

function sectionLabel(type: BuilderSectionType): string {
  switch (type) {
    case "hero":
      return "Hero";
    case "feature-grid":
      return "Feature grid";
    case "benefits":
      return "Výhody";
    case "pricing":
      return "Cenové plány";
    case "faq":
      return "FAQ";
    case "cta":
      return "Výzva k akcii";
    case "testimonial":
      return "Recenzie";
    case "checklist":
      return "Kontrolný zoznam";
    case "comparison-block":
      return "Porovnanie";
    default:
      return "Sekcia";
  }
}

function sectionItems(type: BuilderSectionType, stylePrompt: string, audiencePrompt: string): string[] {
  const styleHint = sanitizePrompt(stylePrompt).replace(/["']/g, "");
  const audienceHint = sanitizePrompt(audiencePrompt).replace(/["']/g, "");

  switch (type) {
    case "hero":
      return ["Jasná hodnota od prvého riadku", "Jednoduchý vstup pre návštevníka"];
    case "feature-grid":
      return ["Rýchly štart", `Doplnok pre štýl ${styleHint}`, "Bezpečnosť v prvom kroku"];
    case "benefits":
      return ["Prehľadnosť", "Jednoduchá implementácia", `Doručené publiku: ${audienceHint}`];
    case "pricing":
      return ["Starter", "Professional", "Enterprise"];
    case "faq":
      return ["Ako to rýchlo spustím?", "Aké sú vstupy?", "Čo je výsledok?"];
    case "cta":
      return ["Začať teraz", "Zobraziť demo"];
    case "testimonial":
      return ["Reálny výsledok pre tím", "Krátka spätná väzba klienta"];
    case "checklist":
      return ["Definovaný scope", "Kontrola kvality"];
    case "comparison-block":
      return ["Pred návrhom", "Po návrhu", "Po validácii"];
    default:
      return [];
  }
}

function buildSections(
  projectPrompt: string,
  audiencePrompt: string,
  sectionPrompt: string,
  stylePrompt: string,
): BuilderSection[] {
  const style = sanitizePrompt(stylePrompt) || "dark SaaS";
  const title = sanitizePrompt(projectPrompt) || "Nový komponent";
  const types = splitSectionRequests(sectionPrompt);

  return types.map((type, index) => {
    const items = sectionItems(type, style, audiencePrompt);
    const headline = `${sectionLabel(type)} – ${title}`;
    const suffix = index === 0 ? "hlavná sekcia" : "doplnková sekcia";
    const subheadline = `${sanitizePrompt(audiencePrompt) || "Publikovateľský projekt"} · ${sanitizePrompt(style) || "šikovný dizajn"} · ${suffix}`;

    return {
      type,
      headline,
      subheadline,
      primaryCta:
        type === "cta" ? "Spustiť now" : type === "pricing" ? "Vybrať plán" : `${sectionLabel(type)}`,
      secondaryCta: type === "hero" ? "Pozrieť demo" : undefined,
      items,
    };
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeTs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function orderedSectionJsx(
  sections: BuilderSection[],
  asWordpress = false,
): { react: string; tailwind: string; html: string } {
  const sectionRender = sections
    .map((section, index) => {
      const listItems = (section.items ?? [])
        .map((item) => `    <li key="${escapeTs(`${index}-${item}`)}">${escapeTs(item)}</li>`)
        .join("\n");
      const baseClass = asWordpress ? `${WORDPRESS_CLASS_PREFIX}${section.type}` : "space-y-2";

      return `
        <section className="${asWordpress ? "" : baseClass}">
          <h2>${escapeTs(section.headline)}</h2>
          <p>${escapeTs(section.subheadline)}</p>
          ${listItems ? `<ul>${listItems}</ul>` : ""}
          ${section.primaryCta ? `<a href="#">${escapeTs(section.primaryCta)}</a>` : ""}
        </section>`.trim();
    })
    .join("\n");

  const sectionRenderTailwind = sections
    .map((section, index) => {
      const listItems = (section.items ?? [])
        .map((item) => `      <li className="text-sm text-slate-200" key={"${escapeTs(`${index}-${item}`)}"}>${escapeTs(item)}</li>`)
        .join("\n");

      return `
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
          <h2 className="text-2xl font-semibold text-cyan-100">${escapeTs(section.headline)}</h2>
          <p className="mt-2 text-sm text-slate-300">${escapeTs(section.subheadline)}</p>
          ${listItems ? `<ul className="mt-4 grid gap-2">${listItems}\n        </ul>` : ""}
        </section>`.trim();
    })
    .join("\n");

  const htmlRender = sections
    .map(
      (section) =>
        `<section>
          <h2>${escapeHtml(section.headline)}</h2>
          <p>${escapeHtml(section.subheadline)}</p>
          ${section.items && section.items.length ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        </section>`,
    )
    .join("");

  return { react: sectionRender, tailwind: sectionRenderTailwind, html: htmlRender };
}

function renderReactComponent(sections: BuilderSection[], title: string): string {
  return `import type { FC } from "react";

export interface BuilderSection {
  type: string;
  headline: string;
  subheadline: string;
  primaryCta?: string;
  secondaryCta?: string;
  items?: string[];
}

export interface BuilderComponentProps {
  className?: string;
  sections?: BuilderSection[];
}

export const GeneratedBuilderComponent: FC<BuilderComponentProps> = ({
  className = "",
  sections = DEFAULT_SECTIONS,
}) => {
  return (
    <main className={className}>
      <h1>${escapeTs(title)}</h1>
      {sections.map((section) => (
        <section key={section.headline} className="section-block">
          <h2>{section.headline}</h2>
          <p>{section.subheadline}</p>
          {section.items?.length ? (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.primaryCta ? <a href="#">{section.primaryCta}</a> : null}
        </section>
      ))}
    </main>
  );
};

const DEFAULT_SECTIONS: BuilderSection[] = ${JSON.stringify(sections, null, 2)};

export default GeneratedBuilderComponent;
`;
}

function renderTailwindComponent(sections: BuilderSection[], title: string): string {
  const rendered = orderedSectionJsx(sections).tailwind;
  return `import type { FC } from "react";

export interface BuilderSection {
  type: string;
  headline: string;
  subheadline: string;
  primaryCta?: string;
  items?: string[];
}

export interface GeneratedBuilderTailwindProps {
  className?: string;
  sections?: BuilderSection[];
}

const DEFAULT_SECTIONS: BuilderSection[] = ${JSON.stringify(sections, null, 2)};

export const GeneratedBuilderTailwind: FC<GeneratedBuilderTailwindProps> = ({
  className = "",
  sections = DEFAULT_SECTIONS,
}) => {
  const list = sections;
  return (
    <main className={className}>
      <h1 className="text-4xl font-semibold text-cyan-100">${escapeTs(title)}</h1>
      <div className="space-y-4">${rendered}\n      </div>
    </main>
  );
};

export default GeneratedBuilderTailwind;
`;
}

function renderPlainHtml(title: string, sections: BuilderSection[]): string {
  const rendered = orderedSectionJsx(sections).html;
  return `<!doctype html>
<html>
  <body>
    <main>
      <h2>${escapeHtml(title)}</h2>
      ${rendered}
    </main>
  </body>
</html>`;
}

function renderWordPressSafeHtml(title: string, sections: BuilderSection[]): string {
  const list = sections
    .map(
      (section) => `
        <section class="${WORDPRESS_CLASS_PREFIX}${section.type}">
          <h2 class="${WORDPRESS_CLASS_PREFIX}heading">${escapeHtml(section.headline)}</h2>
          <p class="${WORDPRESS_CLASS_PREFIX}text">${escapeHtml(section.subheadline)}</p>
          ${section.items?.length ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
          ${section.primaryCta ? `<p><a href="#" class="${WORDPRESS_CLASS_PREFIX}cta">${escapeHtml(section.primaryCta)}</a></p>` : ""}
        </section>`.trim(),
    )
    .join("\n");

  const html = `<article>
    <h2 class="${WORDPRESS_CLASS_PREFIX}title">${escapeHtml(title)}</h2>
    ${list}
  </article>`;
  return sanitizeWordPressHtml(html);
}

function stripTag(html: string, tag: string): string {
  const openTag = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const closeTag = new RegExp(`</${tag}\\s*>`, "gi");
  return html.replace(openTag, "").replace(closeTag, "");
}

function sanitizeWordPressHtml(html: string): string {
  return FORBIDDEN_TAGS.reduce((out, tag) => stripTag(out, tag), html)
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function isSafeWordPressOutput(html: string): boolean {
  if (FORBIDDEN_TAGS.some((tag) => new RegExp(`<\\s*${tag}\\b`, "i").test(html))) {
    return false;
  }

  if (/\son\w+\s*=|javascript:/i.test(html)) {
    return false;
  }

  const tagMatches = html.match(/<([a-zA-Z0-9-]+)/g) ?? [];
  return tagMatches.every((raw) => {
    const tag = raw.replace("<", "").toLowerCase();
    return ALLOWED_WORDPRESS_TAGS.includes(tag);
  });
}

export function generateBuilderDraft(input: BuilderPromptInput): BuilderGenerationResult {
  const errors = validateBuilderPrompts(input);
  if (errors.length > 0) {
    const dangerous = errors.some((entry) => entry.includes("Nebezpečná"));
    const validatedInput = BuilderPromptInputSchema.parse({
      projectPrompt: sanitizePrompt(input.projectPrompt),
      audiencePrompt: sanitizePrompt(input.audiencePrompt),
      sectionPrompt: sanitizePrompt(input.sectionPrompt),
      stylePrompt: sanitizePrompt(input.stylePrompt),
    });

    return {
      valid: false,
      source: "local-deterministic-draft",
      status: dangerous ? "rejected-due-to-danger" : "missing-required-field",
      schema: {
        title: "",
        target: "html",
        style: sanitizePrompt(validatedInput.stylePrompt) || "dark SaaS",
        sections: [],
        warnings: errors,
      },
      outputs: {
        react: "",
        tailwindReact: "",
        html: "",
        wordpressHtml: "",
        json: "",
      },
      error: errors.join(" "),
    };
  }

  const normalized = {
    projectPrompt: sanitizePrompt(input.projectPrompt),
    audiencePrompt: sanitizePrompt(input.audiencePrompt),
    sectionPrompt: sanitizePrompt(input.sectionPrompt),
    stylePrompt: sanitizePrompt(input.stylePrompt) || "dark SaaS",
  };

  const sections = buildSections(
    normalized.projectPrompt,
    normalized.audiencePrompt || "lokálne služby",
    normalized.sectionPrompt || "hero, features, cta",
    normalized.stylePrompt || "dark SaaS",
  );

  const output: BuilderOutput = {
    title: normalized.projectPrompt,
    target: "react",
    style: normalized.stylePrompt,
    sections,
    warnings: ["Výstup bol vygenerovaný ako lokálny deterministic draft."],
  };

  const parsed = BuilderOutputSchema.parse(output);
  const wpOutput = renderWordPressSafeHtml(parsed.title, parsed.sections);
  if (!isSafeWordPressOutput(wpOutput)) {
    return {
      valid: false,
      source: "local-deterministic-draft",
      status: "invalid-output",
      schema: parsed,
      outputs: {
        react: "",
        tailwindReact: "",
        html: renderPlainHtml(parsed.title, parsed.sections),
        wordpressHtml: wpOutput,
        json: JSON.stringify(parsed, null, 2),
      },
      error: "Výstup neprešiel WordPress bezpečnostnou validáciou.",
    };
  }

  const json = JSON.stringify(parsed, null, 2);

  return {
    valid: true,
    source: "local-deterministic-draft",
    status: "ok",
    schema: parsed,
    outputs: {
      react: renderReactComponent(parsed.sections, parsed.title),
      tailwindReact: renderTailwindComponent(parsed.sections, parsed.title),
      html: renderPlainHtml(parsed.title, parsed.sections),
      wordpressHtml: wpOutput,
      json,
    },
  };
}
