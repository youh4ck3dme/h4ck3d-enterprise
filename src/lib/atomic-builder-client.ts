import { parseAIOutput, ParsedAIOutput } from "@/schema/ai-output";

export type AtomicBuilderMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AtomicBuilderRequest = {
  supabaseUrl: string;
  anonKey: string;
  accessToken?: string | null;
  messages: AtomicBuilderMessage[];
  systemOverride?: string;
  model?: string;
  fetchImpl?: typeof fetch;
};

function assertConfigured(name: string, value: string): void {
  if (!value || /your-|example|placeholder/i.test(value)) {
    throw new Error(`${name} nie je nakonfigurované pre Atomic Builder JSON režim.`);
  }
}

function sanitizeGatewayError(rawError: unknown): string {
  if (!rawError || typeof rawError !== "object") {
    return "AI gateway vrátil chybu bez detailu.";
  }

  const message = (rawError as { error?: unknown }).error;
  if (typeof message !== "string" || message.length === 0) {
    return "AI gateway vrátil chybu bez detailu.";
  }

  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}

export async function requestAtomicBuilderOutput({
  supabaseUrl,
  anonKey,
  accessToken,
  messages,
  systemOverride,
  model,
  fetchImpl = fetch,
}: AtomicBuilderRequest): Promise<ParsedAIOutput> {
  assertConfigured("Supabase URL", supabaseUrl);
  assertConfigured("Supabase anon key", anonKey);

  const response = await fetchImpl(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      messages,
      systemOverride,
      model,
      outputMode: "atomic-builder",
      jsonMode: true,
      responseFormat: { type: "json_object" },
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    const parsedError = (() => {
      try {
        return JSON.parse(rawText);
      } catch {
        return null;
      }
    })();
    throw new Error(sanitizeGatewayError(parsedError));
  }

  return parseAIOutput(rawText);
}
