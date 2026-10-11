# CLAUDE.md: TEDxAmsterdam Website

## Project overview

The website for [tedxamsterdam.nl](https://www.tedxamsterdam.nl), built with Next.js and the [TEDxAmsterdam design system](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system). It replaces the current Webflow site.

During the transition, Webflow stays the content source: content is read from the Webflow CMS through its REST API. The site must be able to switch to another CMS (likely Sanity) later without rewriting pages or components. Everything below serves that goal.

The site is maintained by volunteers who rotate. Optimise for the next person reading the code: plain solutions over clever ones, few dependencies, and documentation that stays current.

## Stack

- **Next.js** (App Router) with **static export** (`output: "export"`). No server runtime, no ISR. Content changes trigger a rebuild.
- **TypeScript** in strict mode.
- **tedx-amsterdam-design-system** from npm for all UI components and design tokens.
- **Zod** to validate every response from an external API.
- **Vitest** and **@testing-library/react** for tests.
- **oxlint** for linting, matching the design system.
- Hosting on **Cloudflare** (static assets). Not Vercel Hobby: its terms exclude non personal use.

## Architecture

```
src/app/              Routes. Pages only compose components and call the content layer.
src/components/       Site specific components that are not generic enough for the design system.
src/content/
  types.ts            Domain types (Speaker, Event, Partner, Pioneer, Talk, BlogPost).
  source.ts           The ContentSource interface every content source implements.
  index.ts            Selects the active source. The only import pages may use.
  webflow/            Webflow adapter: API client, Zod schemas, mappers.
  fixtures/           Fixture source with static data for tests, CI and offline development.
src/lib/              Small shared utilities (env parsing, HTML sanitising, formatting).
tests/                Vitest tests and fixtures.
```

### The content layer is the core rule

- Pages and components **never** import from `src/content/webflow/` or call any CMS API directly. They import from `@/content` and work with domain types only.
- Domain types use clean names that describe the content, not the CMS. Webflow field slugs (`name-of-speaker`, `session-blurb-2`, `descpiption`) appear **only** inside `src/content/webflow/`.
- Every Webflow response is parsed with a Zod schema before mapping. Unknown or malformed data fails the build with a clear error instead of rendering broken pages.
- Mappers are pure functions (Webflow item in, domain object out) and are unit tested with real response shapes.
- Rich text from the CMS is sanitised in the content layer, never rendered raw.

### Known Webflow data quirks

Handle these in the mappers, not in components:

- **Speakers**: in 2026 items the `name` field holds the speaker name and `name-of-speaker` is often empty. In 2025 items `name` holds the session title. Speaker name is `name-of-speaker` with a fallback to `name`.
- **Speakers**: the `show-hide-speaker` switch is not used consistently. Do not filter on it. Only published items (the `/items/live` endpoint) are shown.
- **Events**: use `event-date` (DateTime) for sorting and splitting upcoming and past. Ignore the plain text `date` field.
- **General**: trim strings, drop empty paragraphs (including `<p>‍</p>` with a zero width joiner), and fall back to a meaningful alt text when `alt` is null.
- Do not rename Webflow field slugs. The live Webflow site still binds to them.

## Commands

- `npm run dev`: start the dev server
- `npm run build`: production build (static export to `out/`)
- `npm test`: run all tests
- `npm run typecheck`: TypeScript check
- `npm run lint`: lint with oxlint

Run `npm run lint && npm run typecheck && npm test` before considering any change complete.

## Environment

- Secrets live in `.env.local`, which is git ignored. `.env.example` lists every variable without values and must be updated whenever a variable is added.
- The Webflow token used by the site has **CMS read** permission only.
- `CONTENT_SOURCE=fixtures` runs the site without any token. CI uses this.
- Environment variables are parsed and validated in one place (`src/lib/env.ts`). No `process.env` access elsewhere.

## Git Workflow

- Always make small, focused commits: one logical change per commit.
- Do not batch unrelated changes into a single commit.
- All commits in English.
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `test:`, `refactor:`, `docs:`, `ci:`.
- Keep messages concise and explain *why*, not *what*.
- Every commit leaves the project in a working state: lint, typecheck and tests pass.
- Work on feature branches and merge to `main` through a pull request. Do not push directly to `main`.
- Never commit secrets, tokens or `.env.local`. If one is committed by accident, revoke it in Webflow immediately; removing it from history is not enough.

## Code conventions

- **Named exports only**, except where Next.js requires a default export (`page.tsx`, `layout.tsx`, `not-found.tsx`).
- **Server components by default.** Add `"use client"` only for real interactivity, as low in the tree as possible.
- Use design system components before writing new ones. If a new component is generic, propose it for the design system instead of building it here.
- Styling via CSS Modules and design system tokens. No hardcoded colors, spacing or font sizes, no inline styles, no `!important`.
- No `any`. Prefer types inferred from Zod schemas for raw API data.
- Don't add npm dependencies without a clear reason. State the reason in the commit message.
- Don't add comments that restate the code. Comment the *why*, especially around CMS quirks.
- Don't refactor code unrelated to the current task.

## URLs and SEO

- Keep existing URLs from the Webflow site (for example `/speakers/[slug]`). Any URL that changes gets a 301 redirect.
- Every page defines a title, description, canonical URL and Open Graph data through the Next.js metadata API.
- Speaker pages include JSON-LD structured data.
- Generate `sitemap.xml` and `robots.txt` from the content layer.
- Preview deployments are `noindex`.

## Accessibility

- Target WCAG 2.1 AA, in line with the design system.
- Semantic HTML first, ARIA only when needed.
- Every image has meaningful alt text, or `alt=""` if purely decorative.
- One `h1` per page and a logical heading order.

## TEDx brand rules

- The license disclaimer (`TEDX_DISCLAIMER` from the design system) appears on every page. The About page includes `TEDX_ABOUT_TEDX` and `TEDX_ABOUT_TED`. Always import these constants; never retype the text.
- Always write "TEDx" and "TEDxAmsterdam": lowercase x, attached.
- Sponsor logos are always smaller than the TEDxAmsterdam logo.
- No TED logo and no imagery from TED conferences.
- The site promotes the TEDxAmsterdam event and its programme only.
