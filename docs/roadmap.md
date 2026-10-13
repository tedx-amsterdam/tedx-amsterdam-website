# Roadmap

How we move tedxamsterdam.nl from Webflow to this codebase. Phases run roughly in order; within a phase, work is split into small pull requests.

**Start here in a new session**: read [Now](#now), then the phase it points to. Background lives in [decisions.md](decisions.md) (why things are the way they are), [webflow-content-model.md](webflow-content-model.md) (the CMS data), [current-site.md](current-site.md) (the Webflow site we are replacing) and [website-spec.md](website-spec.md) (the quality bar).

## Now

Update this section in every pull request that changes the state of the project.

**State (13 October 2026)**: phases 0 and 1 are on `main`: the content layer, the Webflow adapter and the speaker pages (#19 to #22), checked by the `content-layer-reviewer` agent. Phase 2 has started: events are in the content layer (#23) and on the `/events` page (#24). The design system workflow is on `main` (#25, decision 23), the rules for coding agents are in `AGENTS.md` (#26, decision 24), and the guardrails from stage A under "Design system" are on `main` (#27, decision 25), and the upgrade to design system 1.3.0 that removes the three workarounds is in review (decision 26). That covers The Website Specification (#2), Lighthouse on every deployment (#6), the project documents (#7), the conformance tests and spec watch (#8), and the Claude Code tooling and the content layer (#11). The official review plugins are enabled in `.claude/settings.json`; the rules for every coding agent are in `AGENTS.md` (decision 24), the Claude Code agents and the `/next` and `/ship` commands are described in `CLAUDE.md`, and `/ship` runs the plugin's code reviewers on code changes. The first spec watch snapshot (#14) is mapped in `docs/website-spec.md`.

#4, #5, #9 and #10 were merged into stacked base branches instead of `main`; #8 and #11 restored their commits unchanged. GitHub now allows only rebase merging and deletes head branches on merge, so stacking is safe again (decision 18). Older history on `main` contains merge commits and one commit pushed directly; do not copy them.

**Next**: the maintainer turns on the ruleset on `main`. Then partners, pioneers, past talks and the blog, one collection per pull request (decision 20).

## Open decisions

Decisions that block or shape upcoming work. Record the outcome in [decisions.md](decisions.md) and remove the line here.

- [ ] **Security contact** for `/.well-known/security.txt`: which foundation address (for example `security@tedxamsterdam.nl`)?
- [ ] **Image formats at launch**: CMS images are JPEGs on the Webflow CDN until the CMS migration (phase 7), which is after launch. Responsive sizes are covered by Webflow's own variants (decision 21), but The Website Specification also requires modern formats (AVIF, WebP). Accept JPEG at launch on purpose (record why in `docs/website-spec.md`), or convert at build time before launch (phase 6), which adds `sharp` to the build.
- [ ] **Copyright holder** in `LICENSE`: Stichting TEDxAmsterdam (current) or the maintainer, as in the design system?
- [ ] **Past talks**: detail pages, or redirect `/speakers-copy/*` to `/speakers` (phase 2)?
- [ ] **Analytics**: GA4 with a consent banner, or cookieless analytics without one (phase 4)?
- [ ] **AI crawlers** in `robots.txt`: allow or block (phase 4)?
- [ ] **Design owner** (after the proof of concept): who approves design system changes next to the maintainer (decision 23)? Until then the maintainer is the only owner, and nothing that needs a second reviewer is turned on.
- [ ] **One repository for the website and the design system?** Decision 23 keeps two repositories, linked through npm releases, and names the trigger to revisit. Stage B is that trigger: every pattern that moves into the design system (`PageHero`, a card grid) then takes four steps across two repositories (a design system pull request, a release pull request, a tag and npm publish, an upgrade pull request here), and a component cannot be tried on a real page before it is published. Options:
  - **Keep two repositories.** Nothing to migrate; a release step for every visual change.
  - **One repository with npm workspaces** (recommended): the design system moves to `packages/design-system/` with its history, and the site imports the same package name from the workspace. A component and the page that uses it change in one pull request with one preview; `CODEOWNERS` on `packages/design-system/` keeps the design boundary. Costs about four pull requests: first align the design system's React 18, Vitest 2 and jsdom 25 with this repository, then import it with `git subtree` or `git filter-repo`, then CI, `CODEOWNERS` and docs (a new decision updating 23), then point Vercel at the subfolder and archive the old repository. The site can no longer pin an older design system version.
  - **Fold it into `src/`.** Simplest code, but Storybook, the showcase and the design boundary go.

  Decide before stage B starts. First answer whether anything outside this site uses the design system: the Vercel showcase (Storybook, `ui_kits/`, `guidelines/`), the CDN bundle `_ds_bundle.js` or the Claude skill (`SKILL.md`). They can stay in a workspace too, but if nobody uses them, the move is simpler.
- [ ] **Design source of truth**: Figma or the design system code? When a design changes, which one changes first, and who keeps the other in sync?
- [ ] **npm package owner**: `tedx-amsterdam-design-system` belongs to the maintainer's personal npm account, and only GitHub Actions in `tedx-amsterdam/tedx-amsterdam-design-system` may publish it (trusted publishing). Move it to an npm organisation, or add a second maintainer, together with the second GitHub owner after the proof of concept?
- [ ] **Design system 2.0** (stage C) is a breaking release: before launch, while this site is its only user, or after?

## Maintainer actions

Things outside the code that someone with admin access has to do.

- [x] GitHub settings: only "Allow rebase merging", "Automatically delete head branches" on, "Allow GitHub Actions to create and approve pull requests" on (also at organisation level)
- [x] Delete stale branches: `feat/project-setup`, `feature/project-setup`, `chore/website-spec`, `chore/lighthouse-ci`, `chore/project-context-docs`, `feature/spec-conformance-tests`, `chore/spec-watch`, `chore/restore-spec-conformance`, `chore/claude-agents`, `feature/content-layer`, `chore/restore-agents-and-content-layer`
- [ ] Branch ruleset on `main` (pull request required, CI and Lighthouse must pass, no force push): recommended: CI and Lighthouse are not yet required before merging
- [ ] Add a second owner to the GitHub organisation
- [x] Cloudflare: set the build command to `npm run build`, `NODE_VERSION` to `22.23.3` and the content variables for production and preview. Until October 2026 it was still `npx next build` with `NODE_VERSION` `22`, which skips the `build` script in `package.json`; keep it `npm run build`, or the design system images are missing (decision 26)
- [x] Run the Spec watch workflow once by hand to create the initial snapshot (#14)
- [x] Before phase 1b: create a Webflow site token with **CMS read** only for the site build, and add it to Cloudflare as a secret (see 1b)
- [x] Before phase 1b: record the live speakers response unchanged into `tests/fixtures/webflow/speakers-live.json` (`GET /v2/collections/6874c72605e8d57abb48e751/items/live?limit=100`). It contains no secrets, so contributors without a token can build and test 1b from it

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

- [x] `src/content/webflow/client.ts`: fetch live items with pagination, a clear error for bad tokens, and on HTTP 429 wait for `Retry-After` (default 60 seconds) and retry at most 3 times
- [x] `src/content/webflow/schemas.ts`: Zod schemas for the response envelope and speaker items, built from the field table in the content model
- [x] `src/content/webflow/speakers.ts`: mapper with every speaker quirk from the content model, as a pure function, rich text through `sanitizeHtml`
- [x] `src/content/webflow/index.ts`: `createWebflowSource` implementing `ContentSource`, sorted with `sortSpeakers`; wire it into the `webflow` case of `src/content/index.ts`
- [x] Unit tests with the recorded responses in `tests/fixtures/webflow/`, plus a hand edited copy with a broken field that must fail with a readable error
- [x] Cloudflare (maintainer): `WEBFLOW_API_TOKEN` as an encrypted secret and `CONTENT_SOURCE=webflow` for production and preview builds
- [x] Update `docs/website-spec.md` for image alt text
- [x] `content-layer-reviewer` agent in `.claude/agents/`, based on the finished adapter: every content model quirk handled and tested, no Webflow slugs outside `src/content/webflow/`, rich text through `sanitizeHtml`, every response parsed with Zod; run by `/ship` on content layer changes

Done when: unit tests on the recorded responses cover every speaker quirk in the content model, an invalid response makes `getSpeakers()` throw a readable error, and with a token in `.env.local` a one off script described in the pull request fetches and maps every published speaker. No page reads content yet, so the build itself starts calling Webflow in 1c.

### 1c. Speaker pages (`feature/speaker-pages`)

- [x] `/speakers`: overview of current speakers, sorted by `order`
- [x] `/speakers/[slug]`: detail page per speaker via `generateStaticParams`, same slugs as Webflow
- [x] Metadata per page: title, description, canonical, Open Graph
- [x] JSON-LD for each speaker and breadcrumbs on detail pages
- [x] Images with explicit dimensions and lazy loading, following decision 19, plus a `srcset` from Webflow's variants (decision 21)
- [x] Alt text per component: "Portrait of {name}" on the detail page, `alt=""` on an overview card whose link already shows the name
- [x] Rich text headings (`h2` to `h4` from the CMS) never skip a level where they are rendered; add a check to `tests/output/`
- [x] Add one speaker detail URL to the Lighthouse workflow; extend `tests/output/` where useful
- [x] Update `docs/website-spec.md` (title, structured data, breadcrumbs, lazy loading)

Done when: a build with `CONTENT_SOURCE=webflow` fetches the live speakers, every Webflow speaker URL works on the preview with the real content, Lighthouse and the conformance tests pass, and the pages match the design system's speaker designs.

## Phase 2: Remaining collections

- [x] Events (`/events`): content layer in #23, page in #24
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
- [ ] Event rich results: events have a venue name but no address; add one (CMS field or a venue lookup) so search engines accept the `Event` data on `/events`
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
- [x] Build command `npm run build` in Cloudflare, so it matches CI
- [ ] Rebuild on CMS publish (webhook to deploy hook)
- [ ] Rebuild daily, so past events move out of "upcoming" (decision 22)
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

## Design system

The design system enforces the design and the website only composes it (decision 23). Each stage starts on its trigger, not on a date. Everything that works without a second person is turned on now; what needs one is prepared and waits for stage E.

### A. Guardrails (now)

- [x] Check commit messages and branch names in CI, so the Git Workflow rules hold for every tool (decisions 24 and 25)
- [ ] Branch ruleset on `main` turned on (see Maintainer actions), without required approvals: GitHub does not let the only maintainer approve their own pull requests
- `CODEOWNERS` with the maintainer as the only owner for now. It requests reviews but blocks nothing until code owner review is required (stage E)
  - [x] Here: `*.css` and `src/components/`
  - [x] In the design system repository (tedx-amsterdam-design-system#20)
- [x] A conformance test that fails on raw colors, pixel values outside borders and breakpoints, `!important` and inline styles in this repository (`tests/styles.test.ts`)
- [x] Design system 1.3.0, which removes the three workarounds in this repository (decision 26):
  - [x] Ship `assets/` in the npm package; `public/assets/` is now copied from it on dev and build
  - [x] Publish the TEDx required content constants (`src/config/tedx.ts` removed)
  - [x] Mark interactive components with `"use client"`, per component, so components without state stay server components and ship no JavaScript (`src/components/design-system.ts` removed)
- [ ] Add a Facebook icon to `SocialLink`
- [x] Give logo images explicit `width` and `height` (Lighthouse flags them as unsized)
- [ ] Give `SocialLink` icons explicit `width` and `height`, then check every image in `tests/output/`, not only those in `<main>`
- [ ] Align the design system repository settings with this one: rebase merging only, delete branches on merge, a ruleset on `main`

### B. Patterns move into the design system (trigger: a pattern used twice)

- [ ] `PageHero`: the title and intro block, now copied in `src/app/speakers/page.module.css` and `src/app/events/page.module.css`
- [ ] A card grid, when partners or pioneers need the speaker grid
- [ ] Build these from the prototypes in `ui_kits/website/` as real components with stories
- Track the lines of CSS in `src/` (521 in October 2026): they should fall while pages are added

### C. Close the escape hatches (trigger: before launch, or when more volunteers join)

- [ ] Design system 2.0: no `style` prop on components, `className` only for placement, and layout primitives (stack, grid, container) so pages need no layout CSS
- [ ] Ship the adherence lint rules (`_adherence.oxlintrc.json`) in the package as errors, generated from component props, and extend them here
- [ ] Visual regression tests on the design system's Storybook

### D. Editors compose from approved blocks (trigger: the CMS migration, phase 7)

- [ ] Model page content in the new CMS as blocks that map to design system sections; fixed structure for collection pages, blocks only where a page needs flexibility

### E. A second reviewer (trigger: the end of the proof of concept)

Prepared in stage A, turned on when a second person joins. Before that, these would block the only maintainer.

- [ ] Add the second person as owner of the GitHub organisation and to `CODEOWNERS` in both repositories
- [ ] Ruleset on `main` in both repositories: one required approval and "Require review from Code Owners"
