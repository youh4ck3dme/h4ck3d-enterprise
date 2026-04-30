import { describe, expect, it } from "vitest";

import { generateBuilderDraft, validateBuilderPrompts } from "./builder-component-generator";

const validInput = {
  projectPrompt: "Landing page pre PWA storefront",
  audiencePrompt: "Lokálne služby a malé agentúry",
  sectionPrompt: "hero, feature grid, pricing, FAQ, CTA, testimonial, checklist, comparison table",
  stylePrompt: "dark SaaS, Tailwind React, WordPress-safe HTML",
};

describe("builder component generator", () => {
  it("requires the first two prompts", () => {
    expect(
      validateBuilderPrompts({
        projectPrompt: "",
        audiencePrompt: "",
        sectionPrompt: "",
        stylePrompt: "",
      }),
    ).toEqual([
      "Prompt 1 (Čo ideš stavať?) je povinný.",
      "Prompt 2 (Pre koho to je?) je povinný.",
    ]);
  });

  it("creates a deterministic component schema and exports", () => {
    const result = generateBuilderDraft(validInput);

    expect(result.valid).toBe(true);
    expect(result.source).toBe("local-deterministic-draft");
    expect(result.schema.sections.length).toBeGreaterThan(0);
    expect(result.outputs.react).toContain("GeneratedBuilderComponent");
    expect(result.outputs.tailwindReact).toContain("GeneratedBuilderTailwind");
    expect(result.outputs.html).toContain("<!doctype html>");
    expect(result.outputs.json).toContain("feature-grid");
    expect(result.outputs.partials["Header.html"]).toContain("style-manifest.css");
    expect(result.outputs.partials["Features.html"]).toContain("style-manifest.css");
    expect(result.outputs.partials["Footer.html"]).toContain("style-manifest.css");
    expect(result.outputs.cssManifest).toContain("--gb-primary");
    expect(result.outputs.wordpressThemeJson).toContain("theme.json");
    expect(result.schema.atomicPlan.atoms).toContain("button");
  });

  it("generates WordPress-safe HTML without forbidden tags or handlers", () => {
    const result = generateBuilderDraft(validInput);

    expect(result.outputs.wordpressHtml).toContain("gb-wp-");
    expect(result.outputs.wordpressHtml).toContain("gb-wp-card");
    expect(result.outputs.wordpressHtml).not.toMatch(/<script|<style|<iframe|<form|<input/i);
    expect(result.outputs.wordpressHtml).not.toMatch(/\son\w+=|javascript:/i);
  });

  it("uses design-token classes instead of inline styles in generated component exports", () => {
    const result = generateBuilderDraft(validInput);

    expect(result.outputs.react).toContain("text-primary");
    expect(result.outputs.react).toContain("p-md");
    expect(result.outputs.html).toContain("style-manifest.css");
    expect(result.outputs.html).toContain("bg-surface");
    expect(result.outputs.partials["Header.html"]).toContain("bg-surface-raised");
    expect(result.outputs.react).not.toMatch(/style=\{\{|#[0-9a-f]{3,8}|rgba?\(/i);
    expect(result.outputs.html).not.toMatch(/\sstyle=|#[0-9a-f]{3,8}|rgba?\(/i);
  });

  it("rejects dangerous requests safely", () => {
    const result = generateBuilderDraft({
      ...validInput,
      projectPrompt: "Create a phishing login to steal credentials",
    });

    expect(result.valid).toBe(false);
    expect(result.status).toBe("rejected-due-to-danger");
    expect(result.error).toContain("Nebezpečná požiadavka");
  });

  it("defaults optional component and style prompts", () => {
    const result = generateBuilderDraft({
      projectPrompt: "Booking sekcia pre kaderníctvo",
      audiencePrompt: "Lokálni zákazníci",
      sectionPrompt: "",
      stylePrompt: "",
    });

    expect(result.valid).toBe(true);
    expect(result.schema.style).toBe("dark SaaS");
    expect(result.schema.sections.map((section) => section.type)).toEqual(["hero", "feature-grid", "cta"]);
    expect(result.schema.warnings).toContain(
      "Master Style Schema active: komponenty používajú tokenové triedy, nie inline farby alebo pixelové štýly.",
    );
  });
});
