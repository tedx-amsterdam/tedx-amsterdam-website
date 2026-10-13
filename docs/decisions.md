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

All UI comes from `tedx-amsterdam-design-system`. Version 1.2.1 has three gaps (no `"use client"`, no assets in the package, TEDx texts not exported). Each is worked around in exactly one place, listed in AGENTS.md and the roadmap, and removed once the design system is fixed. Fixes belong in the design system, not here.

## 7. Tooling matches the design system (October 2026)

oxlint, Vitest and Testing Library, same as the design system, so contributors switch between the repositories without relearning tools. TypeScript 6 rather than 7, because Next.js tooling is not verified on the native compiler yet.

## 8. The Website Specification as quality bar (October 2026)

[specification.website](https://specification.website) defines what "done" means. `docs/website-spec.md` maps its requirements to the project; mechanical requirements are enforced by tests, measurable ones by Lighthouse, and a weekly workflow reports changes to the spec.

## 9. Lighthouse on real deployments (October 2026)

Lighthouse runs against the Cloudflare deployment of every pull request and every commit on `main`, not against a local server, so headers, compression and the CDN are measured. Thresholds are calibrated on real runs and only go up.

## 10. Git history is atomic and rebased (October 2026)

Small commits in Conventional Commits format, one pull request per feature, bug fix or chore, merged with rebase and merge. Squashing is off because the atomic commits are the history. Details in AGENTS.md.

## 11. Stacked pull requests merge bottom up (October 2026)

When pull requests are stacked, merge the lowest first and delete its branch before merging the next, so GitHub retargets the next one to `main`. Learned the hard way: a stacked pull request was once merged into its stale base branch instead of `main` and had to be reopened, and #4 and #5 later went the same way and had to be restored with cherry picks. Before every merge, check that the base is `main`.

## 12. HSTS without includeSubDomains for now (October 2026)

HSTS is set to one year. `includeSubDomains` and preload wait until launch, when all subdomains of `tedxamsterdam.nl` are known to serve HTTPS; enabling it too early would break any that do not, for a year.

## 13. No script Content Security Policy yet (October 2026)

Next.js inlines scripts, so a script policy needs hashes per page. The current CSP only sets directives that are safe now (`frame-ancestors`, `base-uri`, `object-src`, `form-action`). A full policy is planned in phase 4.

## 14. pages.dev deployments are never indexed (October 2026)

Every `pages.dev` address, including the production alias, sends `X-Robots-Tag: noindex`, so search engines never see a copy of the site next to tedxamsterdam.nl. Lighthouse skips the `is-crawlable` audit for this reason.

## 15. The content source is always chosen explicitly (October 2026)

`CONTENT_SOURCE` must be `fixtures` or `webflow`; there is no default. A fallback to fixtures would let a misconfigured production build publish fake speakers without failing. Variables are read when content is first requested, so builds that do not touch content need none. `.env.example` leaves `CONTENT_SOURCE` blank for the same reason: copying it never picks a source silently.

## 16. Rich text is sanitised with sanitize-html (October 2026)

CMS rich text goes through `sanitizeHtml` in `src/lib/sanitize-html.ts`, which uses the `sanitize-html` package with an allowlist of tags (paragraphs, emphasis, links, lists, quotes, `h2` to `h4`) and link schemes (`https`, `http`, `mailto`). A hand written allowlist would need its own HTML parser to be safe, and regular expressions are not one. DOMPurify needs a DOM, which means jsdom at build time. `sanitize-html` runs in Node, is widely used and maintained, and only runs during the build, so it adds nothing to the pages visitors download. The result has the type `SafeHtml`, so a domain type cannot hold unsanitised HTML.

## 17. No stacked pull requests until GitHub retargets them (October 2026)

Decision 11 assumed each lower branch is deleted before the next merge. It was not, three times: #4 and #5, then #9 and #10, were merged into their base branches instead of `main`, and had to be restored with new pull requests. Stacking stops until "Automatically delete head branches" is on, so that GitHub retargets the next pull request to `main` by itself. Until then, open a pull request only from `main`, and start the next one after the previous is merged.

## 18. Stacked pull requests are allowed again (October 2026)

Reverses decision 17. The repository now allows only rebase merging and deletes head branches on merge, also with "Allow GitHub Actions to create and approve pull requests" on for the spec watch. Merging the lowest pull request of a stack deletes its branch, and GitHub retargets the next one to `main`, which is what went wrong three times. `/ship` still refuses to stack if the setting is ever turned off.

## 19. CMS images stay on the Webflow CDN until the CMS migration (October 2026)

Webflow returns image URLs without dimensions. Images are served from the Webflow CDN as they are. Components give each image an explicit `width` and `height` from their own layout, with a fixed aspect ratio and `object-fit: cover`, and lazy load images below the fold, so pages do not shift while images load. Downloading and optimising images at build time would add a large native dependency (`sharp`) and slow down every build, for a pipeline that phase 7 replaces: Sanity has its own image CDN with resizing. The `Image` domain type therefore holds only `url` and `alt`. The Webflow CDN stops working when the plan ends, so images move with the content before 7 August 2027.

## 20. One collection end to end before the others (October 2026)

Phase 1 builds speakers through the whole chain (Webflow API, Zod schema, mapper, domain type, page, metadata, structured data, Lighthouse) before any other collection. Mistakes in the shared parts, such as the API client, error handling or the `Image` type, are then fixed in one place instead of six. Speakers come first because they have the most data quirks. Phase 2 reuses the client and the schema and mapper pattern, so each further collection is mostly a schema, a mapper and a page, small enough for one pull request and for volunteers to build in parallel.

## 21. Responsive images from Webflow's own variants (October 2026)

Refines decision 19. The speaker photos are 1365 by 2048 pixel JPEGs of about 570 KB, which kept Lighthouse performance at 0.75 to 0.83, below the 0.9 threshold. Webflow already stores smaller copies of every upload on its CDN, named `<name>-p-500`, `-p-800`, `-p-1080` and `-p-1600`, but only for widths below the original's, and the API does not list them. The Webflow source therefore checks each candidate with a HEAD request on the public CDN during the build and passes the ones that exist to `Image.variants`, plus the original with the first missing width as an upper bound, so browsers can still pick it on large screens; components turn them into `srcset`. A failed check only drops the variant and logs a warning, so the original still loads. With this, the speaker pages score 0.93 to 0.98 and weigh a fifth of what they did. The check is fragile by nature (the naming is undocumented), so the migration in phase 7 replaces it with the new CMS's image API.

## 22. Upcoming and past events are split at build time (October 2026)

The site is static, so "upcoming" is decided when it is built: an event moves to "past events" only on the next build after its day ends. Days are counted in Amsterdam time, whatever the time zone of the build machine, and an event stays upcoming for the whole day it takes place. Rebuilding on every CMS publish is not enough on its own, because a quiet week has no publishes; a scheduled daily rebuild keeps the split current (roadmap phase 5). Splitting in the browser instead would need client side JavaScript on a page that is otherwise plain HTML.

## 23. The design system enforces the design (October 2026)

Design decisions live in the design system; the website only composes them. As more volunteers contribute, review alone cannot keep the design consistent: the right thing has to be the easy thing, and the wrong thing has to fail in CI. The target split:

- **Design system**: tokens, components and page sections (such as a page hero or a card grid), plus lint rules that ship in the npm package so they always match the installed version.
- **Website**: routes that combine data from `@/content` with design system sections. Its own CSS is limited to layout with tokens, and checked in CI.
- **CMS** (after the migration, phase 7): editors compose pages from blocks that map to design system sections, never free layout.

The work is staged by trigger, not by date, because the project is young and has one maintainer (see the roadmap, "Design system"). A pattern moves into the design system the second time the website needs it, so the design system grows from real pages instead of guesses.

Two repositories, linked through npm releases (decision 6), stay for now: the design system has its own Storybook, CI and release flow, and a pinned version means a design system change never reaches the site unreviewed. The cost is a release step for every visual change. Revisit with a monorepo (npm workspaces) if most website pull requests turn out to need a design system release first.

## 24. AGENTS.md holds the rules, for every tool (October 2026)

Contributors rotate and will not all use the same coding agent. `AGENTS.md` is the file most agents read (Codex, Cursor, GitHub Copilot and others), so the rules live there. Claude Code reads `CLAUDE.md`, which imports `AGENTS.md` and only adds the Claude Code commands, agents and plugins in `.claude/`. This replaces the choice in #18 to keep the agent rules in `CLAUDE.md`. An import instead of a symlink, because symlinks break on Windows and in some editors.

No instruction files for other tools in advance (`GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`): most read `AGENTS.md` already, and copies of the rules drift apart. When someone uses a tool that does not, add a thin file like `CLAUDE.md` that points to `AGENTS.md` and holds only what is specific to that tool, or point the tool at `AGENTS.md` in its settings (Gemini CLI: `contextFileName`).

An instruction file is a request, not enforcement: a contributor without an agent may never read it. Rules that can be checked belong in CI as well, which applies whatever tool someone uses; commit messages and branch names are the next candidates (roadmap, Design system stage A).

Next.js 16 can write its own block into `AGENTS.md` when an agent runs `next dev`. That stays off (`agentRules: false` in `next.config.ts`): its one rule, to read the bundled Next.js docs, is already under "Stack", and the file stays written by people only.
