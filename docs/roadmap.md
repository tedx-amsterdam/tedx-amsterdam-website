# Roadmap

How we move tedxamsterdam.nl from Webflow to this codebase. Phases run roughly in order; within a phase, work is split into small pull requests.

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

- [ ] Domain types and the `ContentSource` interface
- [ ] Fixture source for tests, CI and offline development
- [ ] Webflow adapter with Zod validation and environment parsing
- [ ] `/speakers` and `/speakers/[slug]`

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
- [ ] Self hosted fonts instead of Google Fonts (GDPR)
- [ ] Analytics loaded only after cookie consent (GDPR)

## Phase 5: Hosting and deployment

- [x] Cloudflare Pages project with preview deployments per pull request (temporarily on a personal account)
- [x] `noindex` on all `pages.dev` addresses
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
