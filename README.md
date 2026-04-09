# 🚀 H4CK3D Enterprise: Cloud Workspace & AI Intelligence

Vitajte v oficiálnom repozitári **H4CK3D Enterprise**. Ide o produkčne odladený, vysoko optimalizovaný inteligentný Cloud Workspace obsahujúci napojenie na umelú inteligenciu, bezpečné prostredie a pokročilú manipuláciu s lokálnymi príkazmi.

## 🌟 Kľúčové funkcie a updaty (Architektúra v2)

Projekt prešiel rozsiahlou stabilizačnou fázou, v ktorej sme vyriešili hlavné technologické dlhy a nasadili nové štandardy:

1. **🔐 Autentifikácia (GitHub & E-mail)**
   - Do systému bola integrovaná natívna Supabase Auth podpora s bleskovo rýchlym **GitHub OAuth** prihlasovaním. Prihlasovanie nevyžaduje e-mailovú verifikáciu, vďaka čomu sa používateľ okamžite ocitne vo svojom paneli.
   
2. **🧠 AI Edge Engine (`gpt-4o-mini`)**
   - Vyhľadávací a chatovací asistent je poháňaný špecializovanou **Supabase Edge Funkciou**, ktorá využíva streamovaný prenos z OpenAI bez výpadkov na CORS. Optimalizované pre generovanie komplexného kódu.

3. **🐘 Real-Time Databáza**
   - Vytvorené tabuľky `chat_sessions` a `chat_messages` v Supabase, ktoré využívajú `Row Level Security (RLS)` architektúru na bezpečnú správu používateľských dát.

4. **♿ A11y UI Fixy (Radix)**
   - Všetky vyskakovacie okná v aplikácii (tzv. Command Palettes) teraz prechádzajú prísnymi kontrolami konzoly od Radix UI, pričom využívajú skryté `DialogTitle` prvky pre asistenčné nástroje.

---

## 📐 Systémová Architektúra

Nasledujúci diagram ukazuje, ako spolu komunikujú jednotlivé uzly H4CK3D Enterprise infraštruktúry.

```mermaid
graph TD
    subgraph "✨ Frontend (Localhost 8080)"
        UI[React UI + Vite + Shadcn]
        CMD[Command Palette ⌘K]
    end

    subgraph "🐘 Supabase Cloud (rcafenpqfsuaieqiagpy)"
        AUTH[Supabase Auth]
        EDGE[Edge Function: 'chat']
        DB[(PostgreSQL Databáza)]
    end

    subgraph "🤖 AI Provider"
        OPENAI[OpenAI gpt-4o-mini]
    end

    UI -->|Prihlásenie (GitHub/Email)| AUTH
    CMD -->|Odoslanie Promptu| EDGE
    EDGE -->|Zabezpečené CORS (204)| EDGE
    EDGE -->|Deno.env.get API Key| OPENAI
    OPENAI -->|Stream Tokenov| EDGE
    EDGE -->|Markdown Response| CMD
    UI -->|Uloženie histórie chatu| DB
```

---

## 🛠 Ako nasadiť projekt

### 1. Príprava prostredia
```powershell
cd C:\Users\42195\Documents\googla-builder1s\googla-builder1s-main\googla-builder1s-main
npm install
```

### 2. Konfigurácia lokálnych kľúčov (`.env.local`)
Aplikácia vyžaduje nasledujúce premenné – všetky boli získané z cloud cloudu a zapísané bezpečne:
```env
SUPABASE_URL="https://rcafenpqfsuaieqiagpy.supabase.co"
VITE_SUPABASE_PROJECT_ID="rcafenpqfsuaieqiagpy"
SUPABASE_PUBLISHABLE_KEY="<VÁŠ-ANON-KEY>"
VITE_SUPABASE_PUBLISHABLE_KEY="<VÁŠ-ANON-KEY>"
```

### 3. Spustenie vývojového servera
Server je plne optimalizovaný pomocou nástroja `Vite` (rýchly hot roaloding):
```powershell
npm run dev
```
Aplikácia následne pobeží v prehliadači na porte **8080**.

### 4. Edge Functions (Deploy)
Ak vykonávate zmeny na backend AI funkciách (v priečinku `supabase/functions/chat`), musíte použiť Supabase CLI s aktuálnym referenčným ID projektu na ich opätovné vypublikovanie:
```powershell
npx supabase functions deploy chat
```

*(Pre správne zobrazovanie syntaxe Edge Funkcií v lokálnom IDE sme vytvorili `tsconfig.json` so špecifikáciou `DenoNamespace` a striktnými `ignore` direktívami na umlčanie linteru bez poškodenia produkčného build-u).*

> **Vyvinuté s extrémnou precíznosťou pre najrýchlejší vývojársky zážitok.** 🚀
