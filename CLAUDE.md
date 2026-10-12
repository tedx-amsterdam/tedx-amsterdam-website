# CLAUDE.md: TEDxAmsterdam Website

## Project overview

The website for [tedxamsterdam.nl](https://www.tedxamsterdam.nl), built with Next.js and the [TEDxAmsterdam design system](https://github.com/tedx-amsterdam/tedx-amsterdam-design-system). It replaces the current Webflow site.

During the transition, Webflow stays the content source: content is read from the Webflow CMS through its REST API. The site must be able to switch to another CMS (likely Sanity) later without rewriting pages or components. Everything below serves that goal.

The site is maintained by volunteers who rotate. Optimise for the next person reading the code: plain solutions over clever ones, few dependencies, and documentation that stays current.

## Start here

This file holds the conventions. The project's state and history live in `docs/`:

1. **`docs/roadmap.md`**: read the "Now" section first. It says where the project stands, which pull requests are open and what to build next.
2. **`docs/decisions.md`**: why things are the way they are. Read it before changing architecture, tooling or process; reverse a decision only by adding a new entry.
3. **`docs/webflow-content-model.md`**: collection IDs, fields and data quirks. Read it before working in `src/content/`.
4. **`docs/current-site.md`**: the Webflow site being replaced, legacy URLs, integrations and where the target designs live.
5. **`docs/website-spec.md`**: the status of every quality requirement.

Keep these documents current in the same pull request as the change that affects them, especially "Now" in the roadmap.

## Working with the maintainer

- The maintainer usually writes in Dutch. Reply in the language of the conversation; code, commits, pull requests and documentation are always in English.
- Before a larger change, explain what you are about to do and why. After it, report what changed and what is still open.
- Ask before anything that is hard to undo or that changes accounts, settings or shared infrastructure (GitHub settings, Cloudflare, Webflow, DNS). Never create tokens or handle secrets; the maintainer does that.
- Ask when a decision belongs to the foundation or the maintainer instead of guessing; add it to "Open decisions" in the roadmap.

## Claude Code setup

Shared through `.claude/` so every contributor gets the same tools. Personal settings go in `.claude/settings.local.json`, which is not committed.

- **`/next`**: compares "Now" in the roadmap with the real git and pull request state, and proposes the next pull request with a plan. It does not start work.
- **`/ship`**: checks, tidies and pushes the current branch and opens or updates its draft pull request. It never marks a pull request ready and never merges.
- **Agents** in `.claude/agents/`, read only, each returns a report: `spec-auditor` (The Website Specification and `docs/website-spec.md`), `a11y-reviewer` (WCAG 2.1 AA), `newcomer` (reads the repository as a new volunteer and reports gaps in the docs). `/ship` runs them when the change calls for it (`spec-auditor` when what the build serves changed, `newcomer` only when onboarding changed); you can also ask for one by name.
- **Plugins** enabled in `.claude/settings.json`: `code-review`, `pr-review-toolkit`, `claude-md-management` and `typescript-lsp` from the official marketplace.

When a rule in this file changes, check whether a command or agent repeats it and update it in the same pull request.

## Stack

- **Next.js** (App Router) with **static export** (`output: "export"`). No server runtime, no ISR. Content changes trigger a rebuild.
- **TypeScript** in strict mode.
- **tedx-amsterdam-design-system** from npm for all UI components and design tokens.
- **Zod** to validate every response from an external API.
- **Vitest** and **@testing-library/react** for tests.
- **oxlint** for linting, matching the design system.
- Hosting on **Cloudflare** (static assets). Not Vercel Hobby: its terms exclude non personal use.

## Architecture

The tree shows the target layout. `src/content/webflow/` arrives in phase 1b, the other domain types with their collections in phase 2.

```
src/app/              Routes. Pages only compose components and call the content layer.
src/components/       Site specific components that are not generic enough for the design system.
  design-system.ts    The only entry point for design system components (see below).
src/config/           Site settings: navigation, external links, legal text.
src/content/
  types.ts            Domain types (Speaker, Event, Partner, Pioneer, Talk, BlogPost).
  source.ts           The ContentSource interface every content source implements.
  index.ts            Selects the active source. The only import pages may use.
  sort.ts             Display order shared by every source.
  webflow/            Webflow adapter: API client, Zod schemas, mappers.
  fixtures/           Fixture source with static data for tests, CI and offline development.
src/lib/              Small shared utilities (env parsing, HTML sanitising, formatting).
tests/                Vitest tests. Recorded API responses go in tests/fixtures/webflow/
                      (not to be confused with the fixture source in src/content/fixtures/).
docs/                 Roadmap, decisions, content model, current site inventory, spec status.
public/assets/        Design system logos and icons (temporary, see public/assets/README.md).
```

### Design system workarounds

The published design system (1.2.1) has three gaps. Each has exactly one workaround in this repo, listed in `docs/roadmap.md` under "Design system follow ups". Remove the workaround when the design system fixes the gap.

- **No `"use client"` directive.** Importing the package in a server component crashes the build. Always import from `@/components/design-system`, which re-exports the components behind a client boundary. A lint rule blocks direct imports; type only imports are allowed.
- **Assets not in the npm package.** Logos and icons are copied into `public/assets/`. Components receive `base="/"` so they resolve `/assets/...` on every route.
- **TEDx required texts not exported.** They live in `src/config/tedx.ts` until the package exports them.

### The content layer is the core rule

- Pages and components **never** import from `src/content/webflow/` or call any CMS API directly. They import from `@/content` and work with domain types only. A lint rule blocks imports of `@/content/*` (and relative paths into `content/*`) outside `src/content/` and `tests/`. Tests are exempt so they can unit test sources and mappers directly.
- Domain types use clean names that describe the content, not the CMS. Webflow field slugs (`name-of-speaker`, `session-blurb-2`, `descpiption`) appear **only** inside `src/content/webflow/`.
- Every Webflow response is parsed with a Zod schema before mapping. Unknown or malformed data fails the build with a clear error instead of rendering broken pages.
- Mappers are pure functions (Webflow item in, domain object out) and are unit tested with real response shapes.
- Rich text from the CMS is sanitised in the content layer with `sanitizeHtml` from `src/lib/sanitize-html.ts`, never rendered raw. Domain types hold it as `SafeHtml`.

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
- `npm test`: run unit tests
- `npm run test:output`: check the build in `out/` against the website specification (run after `npm run build`)
- `npm run typecheck`: TypeScript check
- `npm run lint`: lint with oxlint

Run `npm run lint && npm run typecheck && npm test` before considering any change complete. For changes to pages, metadata or `public/_headers`, also run `npm run build && npm run test:output`.

## Environment

- Secrets live in `.env.local`, which is git ignored. `.env.example` lists every variable without values and must be updated whenever a variable is added.
- The Webflow token used by the site has **CMS read** permission only.
- `CONTENT_SOURCE=fixtures` runs the site without any token. CI uses this.
- Environment variables are parsed and validated in one place (`src/lib/env.ts`). No `process.env` access elsewhere.

## Git Workflow

- Always make small, focused commits: one logical change per commit.
- Do not batch unrelated changes into a single commit.
- All commits in English (American spelling, matching the code).
- Every commit leaves the project in a working state: lint, typecheck and tests pass.

### Commit messages

Follow [Conventional Commits 1.0](https://www.conventionalcommits.org), with the type list and rules of [commitlint config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional):

```
type(scope): subject

Body explaining why.

Footer: value
```

**Types**

| Type | Use for | Example |
| --- | --- | --- |
| `feat` | A new capability visitors or editors notice | `feat(speakers): add speaker detail page` |
| `fix` | A bug that reached `main` | `fix(layout): keep mobile menu above the hero` |
| `perf` | Faster or lighter, same behavior | `perf(speakers): lazy load speaker portraits` |
| `refactor` | Restructured code, same behavior | `refactor(content): extract rich text sanitizer` |
| `style` | Formatting only (whitespace, quotes); never CSS or visual changes | `style: apply editorconfig to config files` |
| `test` | Adding or correcting tests only | `test(content): cover speakers without a photo` |
| `docs` | Documentation only | `docs(readme): explain fixture mode` |
| `build` | Build setup, tooling and dependencies | `build(deps): update next to 16.5.0` |
| `ci` | GitHub Actions and other CI config | `ci: cache Next.js build output` |
| `chore` | Maintenance that fits nothing above | `chore(hosting): add Cloudflare headers` |
| `revert` | Reverting an earlier commit | `revert: feat(speakers): add speaker detail page` |

Visual changes are `feat` (new) or `fix` (broken), not `style`.

**Scopes** are optional but preferred: the area of the codebase, short and lowercase. Current scopes: `layout`, `ui`, `content`, `speakers`, `events`, `partners`, `seo`, `config`, `hosting`, `github`, `lint`, `test`, `deps`, `readme`, `roadmap`, `spec`, `claude`, `license`. Add a scope when a new area appears.

**Subject**: imperative mood ("add", not "added" or "adds"), lowercase start, no trailing period. Keep the whole first line within 72 characters so it is readable in `git log --oneline` and on GitHub.

**Body**: required for anything beyond a trivial change. Separate it from the subject with a blank line. Explain *why* and any trade off; the diff already shows *what*. Wrap at 72 characters.

**Footer**: git trailers, separated from the body by a blank line.

- `BREAKING CHANGE: <what breaks and how to migrate>` for breaking changes, or `!` before the colon (`feat(content)!: ...`).
- `Refs: #123` for related issues; `Closes #123` belongs in the pull request description.
- `Co-Authored-By: Name <email>` to credit everyone who worked on the commit.
- A `revert` commit names the reverted commit: `Refs: <sha>`.

**Fixing your own unmerged work**: do not add a `fix:` commit for a mistake made earlier in the same branch. Fold it into the commit it belongs to with `git commit --fixup <sha>` and `git rebase -i --autosquash main` before review. `fix:` is reserved for bugs that reached `main`.

### Branches

Follow [Conventional Branch](https://conventional-branch.github.io): `<type>/<description>`.

| Prefix | Use for |
| --- | --- |
| `feature/` | A new feature or page |
| `bugfix/` | A bug fix |
| `hotfix/` | An urgent fix for the live site that skips the normal queue |
| `chore/` | Tooling, dependencies, documentation, refactors without new behavior |
| `release/` | Not used: the site deploys continuously from `main` |

- Lowercase letters, numbers and hyphens only: `feature/speaker-pages`, `bugfix/footer-links`.
- Add the issue number when there is one: `feature/12-speaker-pages`.
- One branch per pull request. Keep branches short lived and delete them after merging.

### Pull requests

**Scope**: one pull request is one complete unit of work: one feature, one bug fix or one chore. Not a bundle of unrelated changes, and not one pull request per commit.

- **Size**: aim for a diff a reviewer can read in one sitting, roughly under 400 changed lines excluding lock files and fixtures. Split larger features into a sequence of pull requests that each work on their own, for example the content layer first and the pages second.
- **Refactors separate**: do refactoring that a feature needs in its own pull request first, or at least in its own commits, so behavior changes stay easy to review.
- **Tests and docs travel with the change** in the same pull request.

**Title**: same format as a commit subject, describing the whole change: `feat(speakers): add speaker overview and detail pages`. Mark breaking changes with `!`.

**Description**: use the template in `.github/pull_request_template.md`. Explain what and why, how to test, add screenshots for visual changes, and link the issue with `Closes #123`. Keep the description about the change itself: leave out anything a reviewer does not need, such as tool, generator or session footers.

**Preview link**: every pull request description starts with a link to its Cloudflare preview, so reviewers test the real build instead of reading code only. Cloudflare deploys every branch to `https://<branch>.tedx-amsterdam-website.pages.dev`, where `<branch>` is the branch name in lowercase with `/` and other special characters replaced by `-` (`feature/speaker-pages` becomes `feature-speaker-pages`). Cloudflare shortens long branch names, so copy the branch preview URL from the Cloudflare bot comment on the pull request when in doubt. Update the link if the branch is renamed.

**Process**

- Open a **draft** pull request early for work in progress; mark it ready when it is complete.
- Before asking for review: rebase on `main`, squash fixups, review your own diff, check that CI and the Cloudflare preview are green, and open the preview link yourself.
- Merge with **rebase and merge**. Do not squash: the atomic commits are the project history.
- **Stacked pull requests** (one based on another's branch): merge the lowest first and delete its branch before merging the next, so GitHub retargets the next one to `main`. Check that the base is `main` before every merge.
- Delete the branch after merging.
- Never push directly to `main`, including for small fixes.
- Never commit secrets, tokens or `.env.local`. If one is committed by accident, revoke it in Webflow immediately; removing it from history is not enough.

## Code conventions

- **Named exports only**, except where Next.js requires a default export (`page.tsx`, `layout.tsx`, `not-found.tsx`).
- **Server components by default.** Add `"use client"` only for real interactivity, as low in the tree as possible.
- Use design system components before writing new ones, imported from `@/components/design-system`. If a new component is generic, propose it for the design system instead of building it here.
- Styling via CSS Modules and design system tokens. No hardcoded colors, spacing or font sizes, no inline styles, no `!important`.
- No `any`. Prefer types inferred from Zod schemas for raw API data.
- Don't add npm dependencies without a clear reason. State the reason in the commit message.
- Don't add comments that restate the code. Comment the *why*, especially around CMS quirks.
- Don't refactor code unrelated to the current task.

## Quality reference

[The Website Specification](https://specification.website) is the quality bar for this site. `docs/website-spec.md` maps its requirements to this project.

- **Required** requirements must be met before launch. **Recommended** ones are the default; skipping one needs a reason in `docs/website-spec.md`. Anything marked **Avoid** must not appear.
- Before building a feature, look up the requirements that apply to it. In Claude Code, use the `specification-website` MCP server configured in `.mcp.json`.
- When a change meets or affects a requirement, update its status in `docs/website-spec.md` in the same pull request.
- A weekly workflow (`.github/workflows/spec-watch.yml`) opens a pull request when the spec changes. Handle it like any other pull request: update `docs/website-spec.md` and the roadmap in that pull request before merging.

### Conformance tests

Requirements that can be checked mechanically are tested, and every test links to its requirement:

- `tests/headers.test.ts` checks `public/_headers` (security headers, caching, `noindex` on `pages.dev`).
- `tests/output/` checks every HTML page in the build (doctype, language, title, one `h1`, skip link targets, mixed content, the 404 page).

When a change meets a new requirement that can be checked this way, add a test for it in the same pull request.

### Lighthouse

Lighthouse runs against the Cloudflare deployment of every pull request and of every commit on `main` (`.github/workflows/lighthouse.yml`, thresholds in `lighthouserc.json`). A failure on `main` means the production build regressed and is fixed before other work.

- When adding a new page type, add one URL for it to the workflow.
- Thresholds only go up. Lowering one needs a reason in the commit message.
- A failing Lighthouse check blocks merging, like a failing test.

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

- The license disclaimer (`TEDX_DISCLAIMER`) appears on every page through the site footer. The About page includes `TEDX_ABOUT_TEDX` and `TEDX_ABOUT_TED`. Always import these constants (currently from `src/config/tedx.ts`); never retype the text.
- Always write "TEDx" and "TEDxAmsterdam": lowercase x, attached.
- Sponsor logos are always smaller than the TEDxAmsterdam logo.
- No TED logo and no imagery from TED conferences.
- The site promotes the TEDxAmsterdam event and its programme only.
