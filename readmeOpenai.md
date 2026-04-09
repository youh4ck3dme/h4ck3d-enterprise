# OpenAI setup pre Googla Builder1s

Overene k datumu: 2026-04-09

## Co od teba potrebujem pre prepojenie (tento projekt)

1. `OPENAI_API_KEY` (standardny project key) - toto pouzijeme.
2. Volitelne pre MCP na tvoj VPS:
- `OPENAI_MCP_SERVER_URL` (napr. `https://tvoj-vps-domena/mcp` alebo `.../sse/`)
- `OPENAI_MCP_SERVER_LABEL` (napr. `builder_vps`)
- `OPENAI_MCP_ALLOWED_TOOLS` (CSV, napr. `search,fetch,fix_code`)
- `OPENAI_MCP_REQUIRE_APPROVAL` (odporucane `never` pre server-side backend)
- `OPENAI_MCP_HEADERS_JSON` (volitelne auth headre ako JSON string)

Poznamka ku klucom:
- Pouzi "normal" project key, nie admin key.
- Admin key nedavaj do runtime backendu, nechaj ho len na admin operacie.

## Kde vytvorit vlastnu OpenAI appku

1. Otvor [OpenAI API Dashboard](https://platform.openai.com/).
2. V lavom hornom rohu otvor project switcher a zvol **Create project**.
3. V novom projekte otvor **API Keys** a vytvor novy secret key.
4. Kluc uloz iba do backendu (env premenna `OPENAI_API_KEY`), nikdy nie do frontend kodu.
5. V projekte nastav:
- budget/spend limits
- model permissions
- timove pristupy (kto moze co volat)
6. Integruj API cez Responses endpoint:
- [Responses create](https://platform.openai.com/docs/api-reference/responses/create)

## Rychly minimalny backend priklad (Node)

```ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: "gpt-5.4",
  input: "Vytvor kratky plan sprintu pre BuilderAI funkcionalitu.",
});

console.log(response.output_text);
```

## 10 life hackov pre OpenAI developera a dopad na projekt

1. Structured outputs
- Co: Model vracia JSON podla schema.
- Link: [Structured outputs](https://platform.openai.com/docs/guides/structured-outputs)
- Dopad pre nas: Menej parse chyb, stabilne API kontrakty medzi AI vrstvou a UI.

2. Function calling
- Co: Model vie volat tvoje nastroje/API funkcie.
- Link: [Function calling](https://platform.openai.com/docs/guides/function-calling)
- Dopad pre nas: AI moze spustit validacie, deploy kroky alebo datove akcie kontrolovane backendom.

3. Conversation state
- Co: Natvori dlhsi kontext bez manualneho lepenia celej historie.
- Link: [Conversation state](https://platform.openai.com/docs/guides/conversation-state)
- Dopad pre nas: Stabilnejsie viac-krokove workflows pre user tasky.

4. Prompt caching
- Co: Recykluje cast opakovaneho promptu a znizuje cenu/latenciu.
- Link: [Prompt caching](https://platform.openai.com/docs/guides/prompt-caching)
- Dopad pre nas: Lacnejsie opakovane requesty pri rovnakych system promptoch.

5. Background mode + webhooks
- Co: Dlhotrvajuce joby bez blokovania requestu.
- Linky: [Background mode](https://platform.openai.com/docs/guides/background), [Webhooks](https://platform.openai.com/docs/guides/webhooks)
- Dopad pre nas: Tazke AI ulohy bez timeoutov v UI, vysledok doruceny async.

6. Batch API
- Co: Davkove spracovanie velkeho poctu requestov.
- Link: [Batch API](https://platform.openai.com/docs/guides/batch)
- Dopad pre nas: Offline nightly procesy (napr. sumarizacie, klasifikacia) za nizsiu cenu.

7. Flex processing
- Co: Cost-optimal rezim pre ulohy bez okamzitej odpovede.
- Link: [Flex processing](https://platform.openai.com/docs/guides/flex-processing)
- Dopad pre nas: Lepsia ekonomika pre menej urgentne AI pipeline.

8. File search / Retrieval
- Co: Praca s internymi dokumentmi a knowledge base.
- Linky: [File search](https://platform.openai.com/docs/guides/tools-file-search), [Retrieval](https://platform.openai.com/docs/guides/retrieval)
- Dopad pre nas: AI odpovede ukotvene v dokumentoch projektu namiesto halucinacii.

9. Evals
- Co: Automatizovane meranie kvality promptov a modelov.
- Link: [Working with evals](https://platform.openai.com/docs/guides/evals)
- Dopad pre nas: Regression gate pred release, aby sa kvalita AI vystupov nezhorsovala.

10. Realtime API
- Co: Low-latency interakcie (voice/stream) v realnom case.
- Link: [Realtime API](https://platform.openai.com/docs/guides/realtime)
- Dopad pre nas: Hlasovy alebo live copilot rezim pre rychlu spolupracu s appkou.

## Dolezite bezpecnostne minimum

- Pouzivaj project-based keys, nie zdielane osobne kluce.
- API kluc nikdy nedavaj do browser appky.
- Nastav spend limity a alerty od prveho dna.

Relevantne odkazy:
- [API key - kde ho najst](https://help.openai.com/en/articles/4936850-how-to-create-and-use-an-api-key)
- [API key safety best practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [Projects v API platforme](https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects%3F.ejs)
- [Preco nezdielat API key](https://help.openai.com/en/articles/5008148)
