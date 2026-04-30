Create a landing page based on the system schema.

DESIGN CONSTRAINTS:
Use ONLY these CSS variable references and classes unless you define additional classes inside cssManifest:
- Colors: var(--primary), var(--secondary), var(--surface), var(--surface-raised), var(--text-main), var(--text-muted)
- Typography sizes: text-sm, text-base, text-xl, text-4xl
- Spacing: p-4, p-8, m-4, gap-4, gap-8
- Allowed atoms: Button (primary/secondary), Card (surface/raised), Badge, Heading, Text, Link

OUTPUT REQUIREMENTS:
- Generate the output strictly following the JSON contract.
- Do not write tutorials.
- Do not write deployment instructions.
- Do not write markdown outside JSON fields.
- WordPress partials must be fragments only, not complete HTML documents.
- Use <a class="gb-button ..."> instead of <button> in WordPress partials.
- All generated class names must exist in cssManifest.
