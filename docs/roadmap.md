# Roadmap

How we move tedxamsterdam.nl from Webflow to this codebase. Phases run roughly in order; within a phase, work is split into small pull requests.

**Start here in a new session**: read [Now](#now), then the phase it points to. Background lives in [decisions.md](decisions.md) (why things are the way they are), [webflow-content-model.md](webflow-content-model.md) (the CMS data), [current-site.md](current-site.md) (the Webflow site we are replacing) and [website-spec.md](website-spec.md) (the quality bar).

## Now

Update this section in every pull request that changes the state of the project.

**State (12 October 2026)**: phases 0 and 1a are on `main`. That covers The Website Specification (#2), Lighthouse on every deployment (#6), the project documents (#7), the conformance tests and spec watch (#8), and the Claude Code tooling and the content layer (#11). The official review plugins are enabled in `.claude/settings.json`; the project agents and the `/next` and `/ship` commands are described in CLAUDE.md.

#4, #5, #9 and #10 were merged into stacked base branches instead of `main`; #8 and #11 restored their commits unchanged. Pull requests are not stacked until "Automatically delete head branches" is on (decision 17). Older history on `main` contains merge commits and one commit pushed directly; do not copy them.

**Next**: phase 1b, the Webflow adapter for speakers, on `feature/webflow-speakers` from `main`. It is blocked by the image decision and the recorded speakers response (see below).

## Open decisions

Decisions that block or shape upcoming work. Record the outcome in [decisions.md](decisions.md) and remove the line here.

- [ ] **Security contact** for `/.well-known/security.txt`: which foundation address (for example `security@tedxamsterdam.nl`)?
- [ ] **Image approach** for CMS images (needed before phase 1b settles the `Image` type, because Webflow returns no image dimensions): keep the Webflow CDN with explicit sizes and lazy loading until the CMS migration, or download and optimise images at build time.
- [ ] **Copyright holder** in `LICENSE`: Stichting TEDxAmsterdam (current) or the maintainer, as in the design system?
- [ ] **Past talks**: detail pages, or redirect `/speakers-copy/*` to `/speakers` (phase 2)?
- [ ] **Analytics**: GA4 with a consent banner, or cookieless analytics without one (phase 4)?
- [ ] **AI crawlers** in `robots.txt`: allow or block (phase 4)?

## Maintainer actions

Things outside the code that someone with admin access has to do.

- [ ] **First**: GitHub settings: only "Allow rebase merging", "Automatically delete head branches" on (its absence caused three lost merges), "Allow GitHub Actions to create and approve pull requests" on
- [ ] Delete stale branches: `feat/project-setup`, `feature/project-setup`, `chore/website-spec`, `chore/lighthouse-ci`, `chore/project-context-docs`, `feature/spec-conformance-tests`, `chore/spec-watch`, `chore/restore-spec-conformance`, `chore/claude-agents`, `feature/content-layer`, `chore/restore-agents-and-content-layer`
- [ ] Branch ruleset on `main` (pull request required, CI and Lighthouse must pass, no force push): no longer optional, three stacked merges have now gone wrong
- [ ] Add a second owner to the GitHub organisation
- [ ] Cloudflare: set the build command to `npm run build` (it is `npx next build`)
- [ ] Run the Spec watch workflow once by hand to create the initial snapshot
- [ ] Before phase 1b: create a Webflow site token with **CMS read** only for the site build, and add it to Cloudflare as a secret (see 1b)
- [ ] Before phase 1b: record the live speakers response unchanged into `tests/fixtures/webflow/speakers-live.json` (`GET /v2/collections/6874c72605e8d57abb48e751/items/live?limit=100`). It contains no secrets, so contributors without a token can build and test 1b from it

## Key dates

| Date | Why it matters |
| --- | --- |
| 12 November 2026 | TEDxAmsterdam 2026. Nothing goes live in the weeks around the event. |
| 7 August 2027 | The Webflow Premium plan renews automatically. The new site and CMS must be live before then, and the plan cancelled in time. |

## Phase 0: Foundation

- [x] Next.js app with static export, strict TypeScript
- [x] oxlint, Vitest and CI
- [x] Design system with global styles
- [x] Site header and footer with the TEDx disclaimer
- [x] README and CLAUDE.md

## Phase 1: Content layer and speakers

Proves the architecture end to end with one collection. Three pull requests, stacked or in sequence. The data is described in [webflow-content-model.md](webflow-content-model.md); the target design is `SpeakerPage.jsx` in the design system's UI kit.

### 1a. Content layer with fixtures (`feature/content-layer`)

- [x] Add Zod (justify the dependency in the commit message)
- [x] `src/lib/env.ts`: parse and validate `CONTENT_SOURCE` (`fixtures` or `webflow`, no default: decision 15) and `WEBFLOW_API_TOKEN` (required only for `webflow`); `.env.example`
- [x] `src/content/types.ts`: the `Speaker` type (more types arrive with their collections in phase 2)
- [x] `src/content/source.ts`: the `ContentSource` interface with `getSpeakers()` and `getSpeaker(slug)`
- [x] `src/content/fixtures/`: a fixture source with realistic speakers, including edge cases (no photo, no order, long names)
- [x] `src/content/index.ts`: picks the source from the environment; the only module pages import
- [x] Rich text sanitising in `src/lib/` with an allowlist of tags, using `sanitize-html` (decision 16)
- [x] CI runs with `CONTENT_SOURCE=fixtures`
- [x] Lint rule: `@/content/*` cannot be imported outside the content layer
- [x] Unit tests for env parsing, the fixture source and sanitising

Done when: the app builds and tests pass without any token, and nothing outside `src/content/` knows where content comes from.

### 1b. Webflow adapter for speakers (`feature/webflow-speakers`)

- [ ] `src/content/webflow/client.ts`: fetch live items with pagination, a clear error for bad tokens, and on HTTP 429 wait for `Retry-After` (default 60 seconds) and retry at most 3 times
- [ ] `src/content/webflow/schemas.ts`: Zod schemas for the response envelope and speaker items, built from the field table in the content model
- [ ] `src/content/webflow/speakers.ts`: mapper with every speaker quirk from the content model, as a pure function, rich text through `sanitizeHtml`
- [ ] `src/content/webflow/index.ts`: `webflowSource` implementing `ContentSource`, sorted with `sortSpeakers`; wire it into the `webflow` case of `src/content/index.ts`
- [ ] Unit tests with the recorded responses in `tests/fixtures/webflow/`, plus a hand edited copy with a broken field that must fail with a readable error
- [ ] Cloudflare (maintainer): `WEBFLOW_API_TOKEN` as an encrypted secret and `CONTENT_SOURCE=webflow` for production and preview builds
- [ ] Update `docs/website-spec.md` for image alt text

Done when: unit tests on the recorded responses cover every speaker quirk in the content model, an invalid response makes `getSpeakers()` throw a readable error, and with a token in `.env.local` a one off script described in the pull request fetches and maps every published speaker. No page reads content yet, so the build itself starts calling Webflow in 1c.

### 1c. Speaker pages (`feature/speaker-pages`)

- [ ] `/speakers`: overview of current speakers, sorted by `order`
- [ ] `/speakers/[slug]`: detail page per speaker via `generateStaticParams`, same slugs as Webflow
- [ ] Metadata per page: title, description, canonical, Open Graph
- [ ] JSON-LD for each speaker and breadcrumbs on detail pages
- [ ] Images with explicit dimensions and lazy loading, following the image decision above
- [ ] Alt text per component: the speaker name on the detail page, `alt=""` on an overview card whose link already shows the name
- [ ] Rich text headings (`h2` to `h4` from the CMS) never skip a level where they are rendered; add a check to `tests/output/`
- [ ] Add one speaker detail URL to the Lighthouse workflow; extend `tests/output/` where useful
- [ ] Update `docs/website-spec.md` (title, structured data, breadcrumbs, lazy loading)

Done when: a build with `CONTENT_SOURCE=webflow` fetches the live speakers, every Webflow speaker URL works on the preview with the real content, Lighthouse and the conformance tests pass, and the pages match the design system's speaker designs.

## Phase 2: Remaining collections

- [ ] Events (`/events`)
- [ ] Partners (`/partners`)
- [ ] Impact Program pioneers (`/impact`)
- [ ] Past talks
- [ ] Blog (`/blog`), once it has content

## Phase 3: Static pages

- [ ] Home
- [ ] After Growth
- [ ] About Us, including the mandatory About TEDx and About TED texts
- [ ] Newsletter signup (Mailchimp)
- [ ] Privacy policy

## Phase 4: SEO and parity with the Webflow site

Most open requirements from [The Website Specification](website-spec.md) land in this phase.

- [ ] Metadata and Open Graph on every page
- [ ] JSON-LD on speaker pages
- [ ] `sitemap.xml` and `robots.txt`
- [ ] Redirects for legacy URLs: `/old-home`, `/speakers-new`, `/partners-old`, `/speakers-copy/*`
- [ ] 404 page
- [ ] Raise Lighthouse thresholds to best practices 1 (needs the favicon) and SEO 1 (needs meta descriptions)
- [ ] Self hosted fonts instead of Google Fonts (GDPR)
- [ ] Analytics loaded only after cookie consent (GDPR)

## Phase 5: Hosting and deployment

- [x] Cloudflare Pages project with preview deployments per pull request (temporarily on a personal account)
- [x] `noindex` on all `pages.dev` addresses
- [x] Lighthouse on every preview deployment
- [x] Weekly check for changes in The Website Specification
- [ ] Build command `npm run build` in Cloudflare, so it matches CI
- [ ] Rebuild on CMS publish (webhook to deploy hook)
- [ ] Move the Cloudflare project to a foundation account before launch

## Phase 6: QA and launch (after 12 November)

- [ ] Page by page comparison with the Webflow site
- [ ] Lighthouse and accessibility checks
- [ ] DNS switch and Search Console update
- [ ] Monitoring

## Phase 7: CMS migration (well before 7 August 2027)

- [ ] Sanity project and schemas
- [ ] Import script from Webflow
- [ ] Sanity adapter in the content layer
- [ ] Editor training and handbook
- [ ] Export everything from Webflow, then cancel the plan

## Phase 8: Handover

- [ ] Second admin on GitHub, Cloudflare, the CMS and the domain registrar
- [ ] Documentation reviewed by someone who did not build the site

## Design system follow ups

Tracked here because the website depends on them. Each one removes a workaround in this repo.

- [ ] Ship `assets/` in the npm package (then remove `public/assets/`)
- [ ] Publish the TEDx required content constants (then remove `src/config/tedx.ts`)
- [ ] Mark interactive components with `"use client"` (then remove `src/components/design-system.ts`)
- [ ] Add a Facebook icon to `SocialLink`
- [ ] Give logo images explicit `width` and `height` (Lighthouse flags them as unsized)
