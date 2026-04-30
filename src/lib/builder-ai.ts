import type { AtomicBuilderMessage } from "./atomic-builder-client";
import type { BuilderPromptInput } from "./builder-component-generator";

function normalizePrompt(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function safePromptValue(value: string, fallback: string): string {
  const normalized = normalizePrompt(value);
  return normalized.length > 0 ? normalized : fallback;
}

export function getBuilderGatewayConfig(): { supabaseUrl: string; anonKey: string } | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || /your-|example|placeholder/i.test(supabaseUrl)) {
    return null;
  }

  if (!anonKey || /your-|example|placeholder/i.test(anonKey)) {
    return null;
  }

  return {
    supabaseUrl,
    anonKey,
  };
}

export function getSelectedBuilderModel(): string {
  return window.localStorage.getItem("ai-model") || "mistral-large-latest";
}

export function buildAtomicBuilderSystemOverride(input: BuilderPromptInput): string {
  return [
    "Follow the Builder workflow exactly.",
    `Primary project brief: ${safePromptValue(input.projectPrompt, "Landing page pre moderny produkt")}.`,
    `Target audience: ${safePromptValue(input.audiencePrompt, "SMB a lokalne sluzby")}.`,
    `Requested sections: ${safePromptValue(input.sectionPrompt, "hero, features, cta")}.`,
    `Style and export target: ${safePromptValue(input.stylePrompt, "dark SaaS, React, WordPress-safe HTML")}.`,
    "Use the provided business context inside the content, CTA copy, section hierarchy, and design decisions.",
  ].join("\n");
}

export function buildAtomicBuilderUserPrompt(input: BuilderPromptInput): string {
  const projectBrief = safePromptValue(input.projectPrompt, "Landing page pre moderny produkt");
  const audience = safePromptValue(input.audiencePrompt, "SMB a lokalne sluzby");
  const sections = safePromptValue(input.sectionPrompt, "hero, features, cta");
  const style = safePromptValue(input.stylePrompt, "dark SaaS, React, WordPress-safe HTML");

  return [
    "Vygeneruj kompletny builder vystup pre frontend sekciu alebo landing page.",
    "",
    "KONTEXT BIZNISU:",
    `- Produkt / Projekt brief: ${projectBrief}`,
    `- Cielova skupina / Use case: ${audience}`,
    `- Pozadovane sekcie alebo komponenty: ${sections}`,
    `- Styl komunikacie a export target: ${style}`,
    "",
    "POZIADAVKY:",
    "- Vrat striktne JSON podla Atomic Builder kontraktu.",
    "- React komponent, partials, cssManifest a themeJson musia zodpovedat tomuto konkretnemu briefu.",
    "- Pouzi texty a strukturu tak, aby bolo jasne, pre koho je stranka a co ma navstevnik urobit.",
    "- Zohladni export do WordPress-safe HTML aj React preview.",
    "- Nepis vysvetlenia mimo JSON objektu.",
  ].join("\n");
}

export function buildAtomicBuilderMessages(input: BuilderPromptInput): AtomicBuilderMessage[] {
  return [
    {
      role: "user",
      content: buildAtomicBuilderUserPrompt(input),
    },
  ];
}
