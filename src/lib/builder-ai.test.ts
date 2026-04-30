import { describe, expect, it } from "vitest";

import {
  buildAtomicBuilderMessages,
  buildAtomicBuilderSystemOverride,
  buildAtomicBuilderUserPrompt,
} from "./builder-ai";

const input = {
  projectPrompt: "Landing page pre realitny B2B dashboard",
  audiencePrompt: "Makleri a male realitne timy",
  sectionPrompt: "hero, pricing, FAQ, CTA",
  stylePrompt: "premium editorial warm SaaS, React, WordPress-safe HTML",
};

describe("builder AI prompt helpers", () => {
  it("injects all four builder prompts into the user prompt", () => {
    const prompt = buildAtomicBuilderUserPrompt(input);

    expect(prompt).toContain(input.projectPrompt);
    expect(prompt).toContain(input.audiencePrompt);
    expect(prompt).toContain(input.sectionPrompt);
    expect(prompt).toContain(input.stylePrompt);
  });

  it("builds a single user message payload for the atomic builder gateway", () => {
    const messages = buildAtomicBuilderMessages(input);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      role: "user",
    });
    expect(messages[0].content).toContain("KONTEXT BIZNISU:");
  });

  it("keeps the system override aligned with the builder form state", () => {
    const override = buildAtomicBuilderSystemOverride(input);

    expect(override).toContain(input.projectPrompt);
    expect(override).toContain(input.audiencePrompt);
    expect(override).toContain(input.sectionPrompt);
    expect(override).toContain(input.stylePrompt);
  });
});
