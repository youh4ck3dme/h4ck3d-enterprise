import { describe, expect, it, vi } from "vitest";

import { requestAtomicBuilderOutput } from "./atomic-builder-client";

const validPayload = {
  warnings: [],
  atomicPlan: {
    atoms: ["Button"],
    molecules: ["Hero"],
    sections: ["Hero"],
  },
  reactComponent: "export function LandingPage() { return <main />; }",
  partials: {
    hero: '<section class="gb-hero"><h2>Hero</h2></section>',
  },
  cssManifest: ".gb-hero { padding: 1rem; }",
  themeJson: {
    version: 2,
    settings: {},
  },
  jsonSchema: {
    type: "object",
    properties: {},
  },
};

describe("requestAtomicBuilderOutput", () => {
  it("requests the Supabase chat function in atomic-builder JSON mode", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(validPayload), { status: 200 }));

    const result = await requestAtomicBuilderOutput({
      supabaseUrl: "https://project.supabase.co",
      anonKey: "anon_public_key",
      messages: [{ role: "user", content: "Create landing page" }],
      systemOverride: "Use only allowed token classes.",
      model: "mistral-large-latest",
      fetchImpl,
    });

    expect(result.reactComponent).toContain("LandingPage");

    const [, init] = fetchImpl.mock.calls[0];
    expect(init?.method).toBe("POST");
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      outputMode: "atomic-builder",
      jsonMode: true,
      responseFormat: { type: "json_object" },
    });
  });

  it("validates the response before returning it to UI state", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ warnings: [] }), { status: 200 }));

    await expect(
      requestAtomicBuilderOutput({
        supabaseUrl: "https://project.supabase.co",
        anonKey: "anon_public_key",
        messages: [{ role: "user", content: "Create landing page" }],
        fetchImpl,
      }),
    ).rejects.toThrow();
  });

  it("sanitizes gateway errors", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "Upstream failed with Bearer secret-token-value" }), {
          status: 502,
        }),
    );

    await expect(
      requestAtomicBuilderOutput({
        supabaseUrl: "https://project.supabase.co",
        anonKey: "anon_public_key",
        messages: [{ role: "user", content: "Create landing page" }],
        fetchImpl,
      }),
    ).rejects.toThrow("Bearer [redacted]");
  });
});
