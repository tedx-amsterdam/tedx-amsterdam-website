# CLAUDE.md: TEDxAmsterdam Website

The rules for this repository are in `AGENTS.md`, shared with every other coding agent. This file only adds the Claude Code tooling.

@AGENTS.md

## Claude Code setup

Shared through `.claude/` so every contributor gets the same tools. Personal settings go in `.claude/settings.local.json`, which is not committed.

- **`/next`**: compares "Now" in the roadmap with the real git and pull request state, and proposes the next pull request with a plan. It does not start work.
- **`/ship`**: checks, tidies and pushes the current branch and opens or updates its draft pull request. It never marks a pull request ready and never merges.
- **Agents** in `.claude/agents/`, read only, each returns a report: `spec-auditor` (The Website Specification and `docs/website-spec.md`), `a11y-reviewer` (WCAG 2.1 AA), `content-layer-reviewer` (the content layer rules in `AGENTS.md` and the quirks in `docs/webflow-content-model.md`), `newcomer` (reads the repository as a new volunteer and reports gaps in the docs).
- **Plugins** enabled in `.claude/settings.json`: `code-review`, `pr-review-toolkit`, `claude-md-management` and `typescript-lsp` from the official marketplace. `pr-review-toolkit` provides the code reviewers: `code-reviewer` (conventions in `AGENTS.md`), `silent-failure-hunter` (swallowed errors and silent fallbacks), `type-design-analyzer` (types and schemas) and `pr-test-analyzer` (test coverage).
- **Reviews in `/ship`**: it runs only the reviewers a change calls for. Code reviewers for changes in `src/`, `tests/` and config, `content-layer-reviewer` for changes in `src/content/`, `spec-auditor` when what the build serves changed, `a11y-reviewer` when anything visitors see changed, `newcomer` only when onboarding changed, none for docs only. You can also ask for any of them by name. A finding never overrides `AGENTS.md` or `docs/decisions.md`.
