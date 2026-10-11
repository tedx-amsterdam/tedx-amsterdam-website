# Roadmap

How we move tedxamsterdam.nl from Webflow to this codebase. Phases run roughly in order; within a phase, work is split into small pull requests.

**Start here in a new session**: read [Now](#now), then the phase it points to. Background lives in [decisions.md](decisions.md) (why things are the way they are), [webflow-content-model.md](webflow-content-model.md) (the CMS data), [current-site.md](current-site.md) (the Webflow site we are replacing) and [website-spec.md](website-spec.md) (the quality bar).

## Now

Update this section in every pull request that changes the state of the project.

**State (12 October 2026)**: phase 0 is merged. The Website Specification is adopted (#2). Three pull requests are open and stacked:

1. #6 `chore/lighthouse-ci`: Lighthouse on every deployment, plus a CI fix (base `main`)
2. #4 `feature/spec-conformance-tests`: conformance tests, security headers, caching, 404 skip link fix (base #6)
3. #5 `chore/spec-watch`: weekly check for spec changes (base #4)

Merge them in that order with rebase and merge, deleting each branch before merging the next (see decision 11 in [decisions.md](decisions.md)).

**Next**: phase 1, starting with pull request 1a below.

## Open decisions

Decisions that block or shape upcoming work. Record the outcome in [decisions.md](decisions.md) and remove the line here.

- [ ] **Security contact** for `/.well-known/security.txt`: which foundation address (for example `security@tedxamsterdam.nl`)?
- [ ] **Image approach** for CMS images (needed in phase 1c): keep the Webflow CDN with explicit sizes and lazy loading until the CMS migration, or download and optimise images at build time.
- [ ] **Copyright holder** in `LICENSE`: Stichting TEDxAmsterdam (current) or the maintainer, as in the design system?
- [ ] **Past talks**: detail pages, or redirect `/speakers-copy/*` to `/speakers` (phase 2)?
- [ ] **Analytics**: GA4 with a consent banner, or cookieless analytics without one (phase 4)?
- [ ] **AI crawlers** in `robots.txt`: allow or block (phase 4)?

## Maintainer actions

Things outside the code that someone with admin access has to do.

- [ ] GitHub settings: only "Allow rebase merging", "Automatically delete head branches" on, "Allow GitHub Actions to create and approve pull requests" on
- [ ] Delete stale branches: `feat/project-setup`, `feature/project-setup`, `chore/website-spec`
- [ ] Add a second owner to the GitHub organisation
- [ ] Optional: branch ruleset on `main` (pull request required, CI and Lighthouse must pass, no force push)
- [ ] Cloudflare: set the build command to `npm run build` (it is `npx next build`)
- [ ] After #5 is merged: run the Spec watch workflow once by hand to create the initial snapshot
- [ ] Before phase 1b: create a Webflow site token with **CMS read** only for the site build, and add it to Cloudflare as a secret (see 1b)

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

- [ ] Add Zod (justify the dependency in the commit message)
- [ ] `src/lib/env.ts`: parse and validate `CONTENT_SOURCE` (`fixtures` or `webflow`) and `WEBFLOW_API_TOKEN` (required only for `webflow`); `.env.example`
- [ ] `src/content/types.ts`: the `Speaker` type (more types arrive with their collections in phase 2)
- [ ] `src/content/source.ts`: the `ContentSource` interface with `getSpeakers()` and `getSpeaker(slug)`
- [ ] `src/content/fixtures/`: a fixture source with realistic speakers, including edge cases (no photo, no order, long names)
- [ ] `src/content/index.ts`: picks the source from the environment; the only module pages import
- [ ] Rich text sanitising in `src/lib/` with an allowlist of tags; decide between a small dependency and a hand written allowlist, and record the choice
- [ ] CI runs with `CONTENT_SOURCE=fixtures`
- [ ] Unit tests for env parsing, the fixture source and sanitising

Done when: the app builds and tests pass without any token, and nothing outside `src/content/` knows where content comes from.

### 1b. Webflow adapter for speakers (`feature/webflow-speakers`)

- [ ] `src/content/webflow/client.ts`: fetch live items with pagination, a clear error for bad tokens, and a retry on HTTP 429
- [ ] Zod schema for speaker items, built from the field table in the content model
- [ ] Mapper with every speaker quirk from the content model, as a pure function
- [ ] Unit tests with recorded API responses (copied from the real API, no token in the repo)
- [ ] Cloudflare: `WEBFLOW_API_TOKEN` as an encrypted secret and `CONTENT_SOURCE=webflow` for production and preview builds
- [ ] Update `docs/website-spec.md` for image alt text

Done when: a build with `CONTENT_SOURCE=webflow` fetches the 9 published speakers and maps them correctly, and an invalid response fails the build with a readable error.

### 1c. Speaker pages (`feature/speaker-pages`)

- [ ] `/speakers`: overview of current speakers, sorted by `order`
- [ ] `/speakers/[slug]`: detail page per speaker via `generateStaticParams`, same slugs as Webflow
- [ ] Metadata per page: title, description, canonical, Open Graph
- [ ] JSON-LD for each speaker and breadcrumbs on detail pages
- [ ] Images with explicit dimensions and lazy loading, following the image decision above
- [ ] Add one speaker detail URL to the Lighthouse workflow; extend `tests/output/` where useful
- [ ] Update `docs/website-spec.md` (title, structured data, breadcrumbs, lazy loading)

Done when: every Webflow speaker URL works on the preview with the real content, Lighthouse and the conformance tests pass, and the pages match the design system's speaker designs.

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
