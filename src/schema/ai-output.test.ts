import { describe, expect, it } from "vitest";
import { cleanAIJsonText, parseAIOutput } from "./ai-output";

const validPayload = {
  warnings: [],
  atomicPlan: {
    atoms: ["Button"],
    molecules: ["Hero"],
    sections: ["hero"],
  },
  reactComponent: "export function Landing() { return <main />; }",
  partials: {
    header: "<header class=\"gb-header\">Header</header>",
  },
  cssManifest: ".gb-header{display:block}",
  themeJson: {
    version: 2,
    settings: {},
  },
  jsonSchema: {
    type: "object",
    properties: {},
  },
};

describe("AIOutputSchema", () => {
  it("parses a strict builder JSON payload", () => {
    const parsed = parseAIOutput(JSON.stringify(validPayload));
    expect(parsed.atomicPlan.atoms).toContain("Button");
    expect(parsed.partials.header).toContain("gb-header");
  });

  it("cleans markdown json fences before parsing", () => {
    const wrapped = `\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\``;
    expect(cleanAIJsonText(wrapped)).toBe(JSON.stringify(validPayload));
    expect(parseAIOutput(wrapped).themeJson.version).toBe(2);
  });

  it("rejects conversational text instead of valid JSON", () => {
    expect(() => parseAIOutput("Tu je návod:\n```json\n{}\n```")).toThrow();
  });

  it("requires cssManifest and reactComponent", () => {
    const invalid = { ...validPayload, cssManifest: "", reactComponent: "" };
    expect(() => parseAIOutput(JSON.stringify(invalid))).toThrow();
  });
});
