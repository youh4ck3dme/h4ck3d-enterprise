import { z } from "zod";

export const AtomicPlanSchema = z.object({
  atoms: z.array(z.string()),
  molecules: z.array(z.string()),
  sections: z.array(z.string()),
});

export const AIOutputSchema = z.object({
  warnings: z.array(z.string()),
  atomicPlan: AtomicPlanSchema,
  reactComponent: z.string().min(1),
  partials: z.record(z.string().min(1)),
  cssManifest: z.string().min(1),
  themeJson: z.object({
    version: z.literal(2),
    settings: z.record(z.unknown()).default({}),
  }).passthrough(),
  jsonSchema: z.object({
    type: z.string(),
    properties: z.record(z.unknown()).default({}),
  }).passthrough(),
});

export type ParsedAIOutput = z.infer<typeof AIOutputSchema>;

export function cleanAIJsonText(rawText: string): string {
  return rawText
    .trim()
    .replace(/^```(?:json|JSON)?\s*/u, "")
    .replace(/\s*```$/u, "")
    .trim();
}

export function parseAIOutput(rawText: string): ParsedAIOutput {
  const cleaned = cleanAIJsonText(rawText);
  const parsed = JSON.parse(cleaned) as unknown;
  return AIOutputSchema.parse(parsed);
}
