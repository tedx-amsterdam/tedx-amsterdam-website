# Roadmap

How we move tedxamsterdam.nl from Webflow to this codebase. Phases run roughly in order; within a phase, work is split into small pull requests.

**Start here in a new session**: read [Now](#now), then the phase it points to. Background lives in [decisions.md](decisions.md) (why things are the way they are), [webflow-content-model.md](webflow-content-model.md) (the CMS data), [current-site.md](current-site.md) (the Webflow site we are replacing), [analytics.md](analytics.md) (what the live site measures and how to keep it at launch) and [website-spec.md](website-spec.md) (the quality bar).

## Now

Update this section in every pull request that changes the state of the project.

**State (21 October 2026)**: phases 0 and 1 are on `main`: the content layer, the Webflow adapter and the speaker pages (#19 to #22), checked by the `content-layer-reviewer` agent. Phase 2 has started: events are in the content layer (#23) and on the `/events` page (#24). The design system workflow is on `main` (#25, decision 23), the rules for coding agents are in `AGENTS.md` (#26, decision 24), and the guardrails from stage A under "Design system" are on `main` (#27, decision 25), the upgrade to design system 1.3.0 removed the three workarounds (#28, decision 26), `/speakers` loads only its first photo eagerly to stay above the Lighthouse threshold (#30, #32), `npm run lighthouse` runs the same checks locally (#31), and the ruleset on `main` requires `ci` and `lighthouse` before every merge. Design system 1.3.1 self hosts the Arimo fallback font instead of loading it from Google Fonts, and 1.4.0 aligns its tokens and components with the Figma designs (decision 27); every page now sits in the 1080px content column with the red edge glow. That covers The Website Specification (#2), Lighthouse on every deployment (#6), the project documents (#7), the conformance tests and spec watch (#8), and the Claude Code tooling and the content layer (#11). The official review plugins are enabled in `.claude/settings.json`; the rules for every coding agent are in `AGENTS.md` (decision 24), the Claude Code agents and the `/next` and `/ship` commands are described in `CLAUDE.md`, and `/ship` runs the plugin's code reviewers on code changes. The first spec watch snapshot (#14) is mapped in `docs/website-spec.md`, and so is the update of 19 October (#47). Since then the design system has been aligned with busy.studio's Figma designs (decision 27): 1.4.0 brought the tokens and components, and this site moved every page into the 1080px content column with the red edge glow (#38), with the speaker photos sized for it (#40). Pull requests here show a "Review this" section, a "PR attention" comment and before and after screenshots (#39, #41); design system pull requests get a Storybook preview on GitHub Pages and screenshots of the stories that changed (tedx-amsterdam-design-system#43). Mobile layouts are derived in the design system and follow mobile conventions (decision 28). Design system 1.5.0 brings the mobile header with 44px tap targets (#39), Helvetica before Helvetica Neue (#40), the mobile type sizes (#42), the form and checkbox (#44), and the meta lines, social links and accent on red (#46). Design system 1.5.1 sets body text at 16px below 768px, and 1.6.0 ships `webflow/site.css`, the Webflow site's own styles: since 25 October the live Webflow site loads it from jsDelivr instead of keeping a copy in its custom code (tedx-amsterdam-design-system#52), and a weekly workflow there opens an issue when the site's variables drift from the tokens (tedx-amsterdam-design-system#56). This site uses 1.5.1, with footer links of 44px on touch and the speaker photos side by side without gaps (#46). On 18 October every speaker photo in Webflow was replaced by a copy without the smaller variants that decision 21 relied on, and Lighthouse failed on `main`; since decision 29 (#48) the build resizes every CMS image into WebP copies with `sharp` and serves them from `/images/`, and `/speakers` weighs about 210 KB instead of 3.4 MB.

Analytics: [analytics.md](analytics.md) describes what the live Webflow site measures through Google Tag Manager since 26 October 2026, and this site pushes the same events to the data layer without loading Tag Manager yet (`feature/analytics-datalayer`).

#4, #5, #9 and #10 were merged into stacked base branches instead of `main`; #8 and #11 restored their commits unchanged. GitHub now allows only rebase merging and deletes head branches on merge, so stacking is safe again (decision 18). Older history on `main` contains merge commits and one commit pushed directly; do not copy them.

**Next**: the `/partners` page, now that partners are in the content layer (`feature/webflow-partners`). Then pioneers, past talks and the blog, one collection per pull request (decision 20). The speaker card with the talk title first waits for content: no 2026 speaker has a talk title in the CMS (checked 21 October 2026).

## Open decisions

Decisions that block or shape upcoming work. Record the outcome in [decisions.md](decisions.md) and remove the line here.

- [ ] **Security contact** for `/.well-known/security.txt`: which foundation address (for example `security@tedxamsterdam.nl`)?
- [ ] **Copyright holder** in `LICENSE`: Stichting TEDxAmsterdam (current) or the maintainer, as in the design system?
- [ ] **Past talks**: detail pages, or redirect `/speakers-copy/*` to `/speakers` (phase 2)?
- [ ] **Analytics**: since 26 October 2026 the live site loads GA4 through Google Tag Manager without a consent banner, with data sharing with Google and ads personalisation off ([analytics.md](analytics.md)). Keep that setup, add a consent banner, or move to cookieless analytics (phase 4)?
- [ ] **AI crawlers** in `robots.txt`: allow or block (phase 4)?
- [ ] **Design owner** (after the proof of concept): who approves design system changes next to the maintainer (decision 23)? Until then the maintainer is the only owner, and nothing that needs a second reviewer is turned on.
- [ ] **One repository for the website and the design system?** Decision 23 keeps two repositories, linked through npm releases, and names the trigger to revisit. Stage B is that trigger: every pattern that moves into the design system (`PageHero`, a card grid) then takes four steps across two repositories (a design system pull request, a release pull request, a tag and npm publish, an upgrade pull request here), and a component cannot be tried on a real page before it is published. Options:
  - **Keep two repositories.** Nothing to migrate; a release step for every visual change.
  - **One repository with npm workspaces** (recommended): the design system moves to `packages/design-system/` with its history, and the site imports the same package name from the workspace. A component and the page that uses it change in one pull request with one preview; `CODEOWNERS` on `packages/design-system/` keeps the design boundary. Costs about four pull requests: first align the design system's React 18, Vitest 2 and jsdom 25 with this repository, then import it with `git subtree` or `git filter-repo`, then CI, `CODEOWNERS` and docs (a new decision updating 23), then point Vercel at the subfolder and archive the old repository. The site can no longer pin an older design system version.
  - **Fold it into `src/`.** Simplest code, but Storybook, the showcase and the design boundary go.

  The Figma alignment in stage A is the largest batch of design system changes so far: three pull requests, a release and an upgrade here. Merging first would save those cross repository steps; staying with two repositories makes it the test of whether they still work. Decide before stage B starts. First answer whether anything outside this site uses the design system: the Vercel showcase (Storybook, `guidelines/`), the CDN bundle `_ds_bundle.js` or the Claude skill (`SKILL.md`). They can stay in a workspace too, but if nobody uses them, the move is simpler.
- [ ] **Helvetica webfont licence**: the live Webflow site loads Helvetica Regular and Bold as uploaded font files. Does TEDxAmsterdam hold a webfont licence from Monotype for them? With one, this site can self host Helvetica (not in the public design system package), so Windows and Android show Helvetica instead of Arimo; without one, Arimo stays the fallback there. With the font order fixed in the design system (tedx-amsterdam-design-system#40), macOS and iOS show Helvetica from the system.
- [ ] **npm package owner**: `tedx-amsterdam-design-system` belongs to the maintainer's personal npm account, and only GitHub Actions in `tedx-amsterdam/tedx-amsterdam-design-system` may publish it (trusted publishing). Move it to an npm organisation, or add a second maintainer, together with the second GitHub owner after the proof of concept?
- [ ] **Design system 2.0** (stage C) is a breaking release: before launch, while this site is its only user, or after?

## Maintainer actions

Things outside the code that someone with admin access has to do.

- [x] GitHub settings: only "Allow rebase merging", "Automatically delete head branches" on, "Allow GitHub Actions to create and approve pull requests" on (also at organisation level)
- [x] Delete stale branches: `feat/project-setup`, `feature/project-setup`, `chore/website-spec`, `chore/lighthouse-ci`, `chore/project-context-docs`, `feature/spec-conformance-tests`, `chore/spec-watch`, `chore/restore-spec-conformance`, `chore/claude-agents`, `feature/content-layer`, `chore/restore-agents-and-content-layer`
- [x] Branch ruleset `main` on the default branch, active without bypass: pull request with 0 approvals, rebase merging only, linear history, `ci` and `lighthouse` required, no force push or deletion. The classic branch protection rule is removed
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

Proves the architecture end to end with one collection. Three pull requests, stacked or in sequence. The data is described in [webflow-content-model.md](webflow-content-model.md); the target design is the `speaker-desktop` frame in the [Figma file](current-site.md#figma).

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
- [ ] Partners (`/partners`): content layer in `feature/webflow-partners`, page next
- [ ] Impact Program pioneers (`/impact`)
- [ ] Past talks
- [ ] Blog (`/blog`), once it has content

## Phase 3: Static pages

Build the pages from their Figma frames, the components and patterns in the design system's [Figma audit](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system/blob/main/docs/figma-audit.md), and [design-audit.md](design-audit.md). Home's footer gets the newsletter form, the full width logo and the glow from the designs.

- [ ] Home
- [ ] After Growth
- [ ] About Us, including the mandatory About TEDx and About TED texts
- [ ] Newsletter signup (Mailchimp), with the form ID `wf-form-EMAIL` or a `sign_up` event pushed by the form ([analytics.md](analytics.md))
- [ ] Privacy policy: the live text is on Webflow at `/privacy-policy` since 26 October 2026

## Phase 4: SEO and parity with the Webflow site

Most open requirements from [The Website Specification](website-spec.md) land in this phase.

- [ ] Metadata and Open Graph on every page
- [ ] JSON-LD on speaker pages
- [ ] Event rich results: events have a venue name but no address; add one (CMS field or a venue lookup) so search engines accept the `Event` data on `/events`
- [ ] `sitemap.xml` and `robots.txt`
- [ ] Redirects for legacy URLs: `/old-home`, `/speakers-new`, `/partners-old`, `/speakers-copy/*`
- [ ] 404 page
- [ ] Raise Lighthouse thresholds to best practices 1 (needs the favicon) and SEO 1 (needs meta descriptions)
- [x] Self hosted fonts instead of Google Fonts (GDPR): the design system ships Arimo since 1.3.1
- [ ] Analytics: load the Tag Manager container on the production domain only, following the analytics decision; see [analytics.md](analytics.md). The site already pushes `ticket_click`, `application_click`, `partner_contact` and `page_not_found` to the data layer (`feature/analytics-datalayer`), so at launch their triggers switch to custom events

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
- [ ] Tracking parity: the launch checklist in [analytics.md](analytics.md), published in Tag Manager together with the DNS switch
- [ ] DNS switch and Search Console update: keep the verification meta tag, submit the new `sitemap.xml`
- [ ] Internet.nl website test on the production domain: TLS configuration, RPKI and IPv6 (see `docs/website-spec.md`)
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
- [x] Branch ruleset on `main` turned on (see Maintainer actions), without required approvals: GitHub does not let the only maintainer approve their own pull requests
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
- [ ] Align the foundations with the Figma designs, following the design system's [Figma audit](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system/blob/main/docs/figma-audit.md) (decision 27). **When: now, before the phase 2 pages.** These changes only alter the look of components this site already uses, this site is the design system's only user, and every page built on the current foundations would have to be redone. One design system release (1.4.0) in three pull requests, then one upgrade here:
  - [x] Tokens (tedx-amsterdam-design-system#34): the 1080px content column and the desktop and mobile grid, the display, page title, section heading and intro styles, Regular 14px and Light, white at 70% and 50%, and `#FF7919` instead of the unused `#F36C21`
  - [x] Primitives (tedx-amsterdam-design-system#35): `Button` (heights from the grid, uppercase labels), `ArrowLink` (uppercase), `Tag` (white eyebrows, a neutral meta line with a red dot), `Badge` (square black label), `Tabs` (active tab red, no underline)
  - [x] Composites (tedx-amsterdam-design-system#37, released in 1.4.0): `NavigationBar` (link style, content column, optional button), `SectionHeader` (48px, a supported way to set words in red), `Stat`, `MediaCard` (a real `<img>` with alt text, and a `Badge`)
  - [x] Here: upgrade to 1.4.0, put every page and the footer in the content column, add the edge glow, and restyle the page heroes
  - [ ] Here: bring the speaker card and `/speakers/[slug]` in line with [design-audit.md](design-audit.md) (talk title first); check first that the CMS has a talk title for every speaker
- [x] Align the design system repository settings with this one: rebase merging only, delete branches on merge, a ruleset on `main` with `ci` required
- [x] Review aids in every pull request, so the maintainer sees what needs judgment without reading the whole diff: a "Review this" section in the template and `/ship` with preview links to the changed pages, and a "PR attention" comment from CI (`scripts/pr-attention.ts`) that lists dependencies, decisions, thresholds, headers and CI changes
- [x] A Storybook preview per design system pull request on GitHub Pages, with screenshots of every story that visibly changed on a phone and desktop (tedx-amsterdam-design-system#43)
- [x] Before and after screenshots of every page type as a pull request comment, desktop and mobile, production next to the preview, only for pages that visibly changed (`scripts/screenshots.ts`, `.github/workflows/screenshots.yml`); stored on the branch `pr-screenshots`, one commit, removed when the pull request closes
- [x] A test in the design system that fails on raw palette colors and pixel values in its components, like `tests/styles.test.ts` here. Its own rules ask for semantic tokens, yet components use `--tedx-red` 30 times instead of `--accent` and contain 85 raw pixel values. Fix them while the components are aligned with Figma, then turn the test on
  - [x] Colours (tedx-amsterdam-design-system#59): every component colour comes from a semantic token, five new ones included, and the test fails on raw colours and palette tokens
  - [x] Pixel values (tedx-amsterdam-design-system#60): spacing, type, radii and effects come from tokens, eleven new ones included; a component's own width and height may stay raw, and a value the designs set off the scale keeps a `/* Figma: … */` comment. The Accordion and the Toast close button moved onto the scale; neither is in the designs
- [x] Upgrade the design system to Vitest 5 and Storybook 10 in one pull request, replacing Dependabot's tedx-amsterdam-design-system#18, #19 and #25: all three fail because the jest-dom matchers lose their types under Vitest 5. Storybook 10.3 brings the official MCP addon and components manifest, so coding agents can look up components and props; it is in the design system's `.mcp.json`, since its Storybook serves it (tedx-amsterdam-design-system#36)
- [ ] Support Windows high contrast (`forced-colors`) in the design system: `Badge` and the checked states of `Checkbox` and `Radio` are drawn with background colors, which that mode removes
- [ ] A status per component in the design system's readme (draft, stable), so a newcomer sees what is finished; a component is stable when it matches the Figma audit, has stories for its states and passes the axe sweep
- [ ] A deprecation rule in the design system's readme: mark a token or prop as deprecated in a minor release with its replacement, remove it in the next major. First candidates: `--fs-mega` and `--fs-h2-lg`, which the designs no longer use
  - [x] The rule, with what the package's public API is and that class names are private (tedx-amsterdam-design-system#63)
  - [ ] Deprecate `--fs-mega` and `--fs-h2-lg`
- [ ] Breakpoints in the design system (decision 28): document 480px, 768px and 1024px in its readme (custom properties cannot be used in media queries), give every component a story at 390px wide, and use container queries where a component's width depends on its column rather than the screen. Today it has one media query (767px)
- [ ] Mobile conventions (decision 28), from measuring production at 390px and 320px wide in October 2026. No horizontal scrolling at 320px and the viewport tag are fine already. To fix:
  - [x] In the design system (tedx-amsterdam-design-system#39): tap targets of at least 44px for the `NavigationBar` logo link (16px high) and menu button (40 × 34), and a larger hit area for `ArrowLink` (14px high) and `Breadcrumb` links (18px)
  - [x] In the design system (#39): keep the `NavigationBar` call to action visible on mobile instead of only inside the menu, and label the menu button "Menu" next to its icon
  - [x] Here: footer links (18px high) and the footer logo link (23px) at 44px high on touch (#46)
  - [x] In the design system (tedx-amsterdam-design-system#49, released in 1.5.1 and used here in #46): `--text-body` at the mobile size below 768px (16px instead of 20px), so lines are not cut to some 30 characters. In the token rather than in this site, which sets `--text-body` in six places
  - [ ] A mobile check in the screenshots workflow that reports controls under 24px and horizontal scrolling at 320px, so these do not come back
- [ ] Fix what a full pass through Figma found in October 2026 (the ⚠️ rows in the design system's [Figma audit](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system/blob/main/docs/figma-audit.md)), in this order:
  - [x] In the design system (tedx-amsterdam-design-system#42): mobile type in every component below 768px (section headings 30px, stats 60px, tags and arrow links 12px, card names 16px); the tokens exist, no component uses them yet. This touches every page, so it goes first
  - [x] In the design system (tedx-amsterdam-design-system#44): `Input` underline and `Checkbox` border in white at 100%, the checkbox as a 16px square, its label Bold 14px at 70% with an underlined link; needed before the newsletter (phase 3)
  - [x] In the design system (tedx-amsterdam-design-system#46): `Tag` `muted` and the `MediaCard` excerpt in white at 50% (the designs' 40% fails WCAG AA on black), `SocialLink` with a 24px icon and a small size (16px text) next to the footer size, and `Accent` for the red band (black text, white words)
  - [x] Here: speaker photos side by side without gaps, four of 270px in the column, as designed (#46)
  - [x] In the design system (tedx-amsterdam-design-system#54): the edge glow and the photo shadow with the values of the event page design: `--glow-edge-width` (220px), `--glow-blur` (50px, Figma's layer blur of 100) and `--shadow-glow-red`. The corner and footer glows stay approximations
  - [ ] Here: draw the edge glow from those tokens instead of the 80px red bar in `src/app/globals.css`, once a release has them (1.7.0)
- [x] Design system 1.5.0: release the mobile header (#39), the font order (#40), the mobile type (#42), the form (#44) and the remaining fixes above (tedx-amsterdam-design-system#48), then upgrade here together with the site's mobile fixes: footer tap targets and the photo grid (#46). The 16px body text came with 1.5.1 (tedx-amsterdam-design-system#50)

Compared with common design system practice in October 2026 (among others [Carbon's component checklist](https://carbondesignsystem.com/contributing/component-checklist), the [W3C design tokens format](https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-format-20251028/) and [Storybook's AI docs](https://storybook.js.org/docs/ai)). Considered and left out for one website run by volunteers: tokens as DTCG JSON with Style Dictionary (worth it only with a second platform, such as an app), a third tier of component tokens, Changesets and codemods (one consumer), Figma Code Connect (we cannot edit the Figma file) and CSS cascade layers (until site overrides start to clash).

### B. Patterns move into the design system (trigger: a pattern used twice)

- [ ] `PageHero`: the title and intro block, now copied in `src/app/speakers/page.module.css` and `src/app/events/page.module.css`
- [ ] Speaker card as designed (talk title first, a "Watch the talk" link for past speakers), when past talks arrive (phase 2); check first that the CMS has a talk title for every speaker
- [ ] Person card (photo, name, role or description), with the pioneers (phase 2); the team page reuses it
- [ ] CTA band (red section with a heading and the email form), with partners (phase 2) or the newsletter (phase 3), whichever comes first
- [ ] Detail rows (label and value between lines) and carousel arrows, with the home page (phase 3)
- [ ] Build each from the [Figma designs](current-site.md#figma) as real components with stories, and update its row in the design system's [Figma audit](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system/blob/main/docs/figma-audit.md)
- [ ] Page stories in the design system's Storybook (`Pages/Home`, `Pages/Speakers`, and so on): each page from the Figma designs composed of the real components with neutral sample content, so there is a click-through example of every page again. They replace the removed `ui_kits/website/` prototype, which copied the components with inline styles and the 2025 theme (tedx-amsterdam-design-system#31). Add a page story when its sections move into the design system; the CI Storybook build and the a11y addon then check it
- Track the lines of CSS in `src/` (521 in October 2026): they should fall while pages are added

### C. Close the escape hatches (trigger: before launch, or when more volunteers join)

- [ ] Design system 2.0: no `style` prop on components, `className` only for placement, and layout primitives (stack, grid, container) so pages need no layout CSS
  - Logos and icons as React components (inline SVG) instead of image files, so the `base` prop, `scripts/design-system-assets.ts` and `public/assets/` go away and a missed copy step can no longer serve broken images
  - Clean up the design system repository root: remove what nothing uses (the CDN bundle `_ds_bundle.js`, `SKILL.md`, `vercel.json`, the generated `_ds_manifest.json`), after the open decision on the Vercel showcase
- [ ] Test the design system as a consumer in its CI: install the output of `npm pack` in a small Next.js app and build it, so problems like the missing `"use client"` or assets show up before a release
- [ ] Run the design system's tests on React 18 and React 19: its peer dependency promises both, CI tests only 18, and this site runs 19
- [ ] Let components pass a `ref` to their element: none of the 23 do, so under React 18 a site cannot focus an `Input` or `Button`. Either wrap them in `forwardRef`, or support only React 19, which passes `ref` as a prop, in 2.0
- [ ] Ship the adherence lint rules (`_adherence.oxlintrc.json`) in the package as errors, generated from component props, and extend them here
- [ ] Visual regression tests on the design system's Storybook: screenshots of every story compared on each pull request (the Storybook test runner, or Chromatic's free tier). Worth starting during the Figma alignment if a component change surprises us

### D. Editors compose from approved blocks (trigger: the CMS migration, phase 7)

- [ ] Model page content in the new CMS as blocks that map to design system sections; fixed structure for collection pages, blocks only where a page needs flexibility

### E. A second reviewer (trigger: the end of the proof of concept)

Prepared in stage A, turned on when a second person joins. Before that, these would block the only maintainer.

- [ ] Add the second person as owner of the GitHub organisation and to `CODEOWNERS` in both repositories
- [ ] Ruleset on `main` in both repositories: one required approval and "Require review from Code Owners"
- [ ] A `CONTRIBUTING.md` and a pull request template in the design system repository, like this one's
- [ ] Revisit rebase merging (decision 18) with the people who join: it keeps every commit, but volunteers then have to write clean commits and squash fixups themselves. Squash merging needs only a correct pull request title; the commit check in CI would then check the title instead of each commit
