# Decisions

Architecture and process decisions with their reasons, newest last. Before changing anything listed here, read the reason; to reverse a decision, add a new entry that explains why instead of editing the old one.

Format per entry: **decision**, then context, reason and consequences.

## 1. Leave Webflow for a codebase of our own (October 2026)

Webflow is awkward to maintain for developers on the team, and its plan costs money every year. The site moves to a codebase in this repository.

## 2. Use Webflow as a headless CMS during the transition (October 2026)

The Webflow Premium plan is paid until 7 August 2027 and the CMS is still needed in the meantime. Editors keep working in Webflow while the new site reads its content through the REST API.

Consequence: all CMS access goes through the content layer (`src/content/`), behind a `ContentSource` interface. Pages never see Webflow field names, so the CMS can be replaced without touching pages.

## 3. Replace Webflow with Sanity later, tentatively (October 2026)

Sanity has a generous free plan and a nonprofit plan, a good editor for non technical volunteers, and hosting is not our concern. Storyblok is the alternative if editors need visual page building. Final choice in phase 7, well before the Webflow plan ends.

## 4. Next.js with static export (October 2026)

The design system is a React library, so a React framework uses it directly. Astro would need React islands for every component. Static export (`output: "export"`) means plain HTML on a CDN: no server to run, free hosting and nothing to patch. Content changes trigger a rebuild instead of ISR.

Consequences: no server features (API routes, middleware, ISR, on demand image optimisation). `next/image` runs with `unoptimized: true` until an image approach is chosen in phase 1.

## 5. Cloudflare Pages for hosting (October 2026)

Free for static sites with unlimited requests, preview deployments per branch, and headers via `public/_headers`. Vercel's Hobby plan is excluded because its terms only allow personal, non commercial use.

The project runs on the maintainer's personal Cloudflare account for now and moves to a foundation account before launch. The real domain is only connected on the foundation account.

## 6. The design system from npm, with temporary workarounds (October 2026)

All UI comes from `tedx-amsterdam-design-system`. Version 1.2.1 has three gaps (no `"use client"`, no assets in the package, TEDx texts not exported). Each is worked around in exactly one place, listed in CLAUDE.md and the roadmap, and removed once the design system is fixed. Fixes belong in the design system, not here.

## 7. Tooling matches the design system (October 2026)

oxlint, Vitest and Testing Library, same as the design system, so contributors switch between the repositories without relearning tools. TypeScript 6 rather than 7, because Next.js tooling is not verified on the native compiler yet.

## 8. The Website Specification as quality bar (October 2026)

[specification.website](https://specification.website) defines what "done" means. `docs/website-spec.md` maps its requirements to the project; mechanical requirements are enforced by tests, measurable ones by Lighthouse, and a weekly workflow reports changes to the spec.

## 9. Lighthouse on real deployments (October 2026)

Lighthouse runs against the Cloudflare deployment of every pull request and every commit on `main`, not against a local server, so headers, compression and the CDN are measured. Thresholds are calibrated on real runs and only go up.

## 10. Git history is atomic and rebased (October 2026)

Small commits in Conventional Commits format, one pull request per feature, bug fix or chore, merged with rebase and merge. Squashing is off because the atomic commits are the history. Details in CLAUDE.md.

## 11. Stacked pull requests merge bottom up (October 2026)

When pull requests are stacked, merge the lowest first and delete its branch before merging the next, so GitHub retargets the next one to `main`. Learned the hard way: a stacked pull request was once merged into its stale base branch instead of `main` and had to be reopened, and #4 and #5 later went the same way and had to be restored with cherry picks. Before every merge, check that the base is `main`.

## 12. HSTS without includeSubDomains for now (October 2026)

HSTS is set to one year. `includeSubDomains` and preload wait until launch, when all subdomains of `tedxamsterdam.nl` are known to serve HTTPS; enabling it too early would break any that do not, for a year.

## 13. No script Content Security Policy yet (October 2026)

Next.js inlines scripts, so a script policy needs hashes per page. The current CSP only sets directives that are safe now (`frame-ancestors`, `base-uri`, `object-src`, `form-action`). A full policy is planned in phase 4.

## 14. pages.dev deployments are never indexed (October 2026)

Every `pages.dev` address, including the production alias, sends `X-Robots-Tag: noindex`, so search engines never see a copy of the site next to tedxamsterdam.nl. Lighthouse skips the `is-crawlable` audit for this reason.
