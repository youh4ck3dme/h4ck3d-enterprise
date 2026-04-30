# Atomic WordPress Lab

Local WordPress FSE experiment for the one-MAN-show builder stage.

This lab connects the Vite/React builder workflow with a WordPress Full Site Editing theme. The builder owns the design-token contract and can export WordPress-safe partials, CSS manifest classes, and `theme.json` palette data.

## What Is Included

- Docker Compose WordPress + MySQL + WP-CLI lab
- `atomic-lab` FSE theme
- strict `theme.json` design tokens
- WordPress-safe partials:
  - `Header.html`
  - `Features.html`
  - `Footer.html`
- generated `assets/style-manifest.css`
- bridge workflow from the repo root:
  - `npm run wp:bridge:generate`
  - `npm run wp:bridge:sync-theme`
  - `npm run wp:bridge:publish-parts`
  - `npm run wp:bridge:smoke-rest`

## Local Run

From the repository root:

```powershell
npm run wp:lab:setup
```

For a full local reset, including Docker volumes:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-lab.ps1 -ResetVolumes
```

Or from this directory:

```powershell
docker compose up -d
```

WordPress:

```txt
http://localhost:8080
```

WP Admin:

```txt
http://localhost:8080/wp-admin/
```

Create local demo credentials during WP-CLI install. Do not commit real admin passwords.

```txt
admin / choose-a-local-password
```

## Source Of Truth

The builder-side design contract lives in:

```txt
src/design/design-tokens.json
src/lib/design-token-contract.ts
```

The WordPress theme consumes the generated token output through:

```txt
wp-content/themes/atomic-lab/theme.json
wp-content/themes/atomic-lab/assets/style-manifest.css
```

## Verified

This stage was verified locally with:

```txt
npm run typecheck
npm run lint
npm run test
npm run wp:bridge:generate
npm run wp:bridge:sync-theme
npm run wp:bridge:publish-parts
npm run wp:bridge:smoke-rest
```

WordPress smoke:

```txt
home page 200
admin login 200
admin dashboard reachable
Atomic Lab theme active
REST posts endpoint 200
REST themes endpoint 200
```

## Safety Boundaries

- no production deploy
- no shell execution feature
- no destructive actions
- no OAuth or secret material in theme files
- WordPress-safe HTML export rejects scripts, forms, iframes, inline event handlers, and `javascript:` URLs
