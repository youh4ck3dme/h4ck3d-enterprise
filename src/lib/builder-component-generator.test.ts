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
  });

  it("generates WordPress-safe HTML without forbidden tags or handlers", () => {
    const result = generateBuilderDraft(validInput);

    expect(result.outputs.wordpressHtml).toContain("gb-wp-");
    expect(result.outputs.wordpressHtml).not.toMatch(/<script|<style|<iframe|<form|<input/i);
    expect(result.outputs.wordpressHtml).not.toMatch(/\son\w+=|javascript:/i);
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
  });
});

