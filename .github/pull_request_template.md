<!--
Title: use the commit format, for example
  feat(speakers): add speaker overview and detail pages
One pull request is one feature, one bug fix or one chore.
-->

**Preview:** https://BRANCH.tedx-amsterdam-website.pages.dev
<!-- Replace BRANCH with the branch name, "/" becomes "-": feature/speaker-pages becomes feature-speaker-pages. Check the Cloudflare comment below for the exact URL. -->

## Review this

<!-- What the reviewer has to look at, because no check can judge it. Leave out what CI, the tests and Lighthouse already cover. -->

- **Open on the preview**: <!-- a full link to every page this changes, e.g. https://BRANCH.tedx-amsterdam-website.pages.dev/speakers -->
- **Judge**: <!-- the look of a change, a new component prop, a new dependency, a decision, a trade-off. Write "nothing beyond the checks" if so. -->

Two comments below fill in automatically: "PR attention" lists dependencies, decisions, thresholds, headers and CI changes, and "Screenshots" shows before and after for every page that visibly changed.

## What and why

<!-- What does this change and why is it needed? Link the issue. -->

Closes #

## How to test

<!-- Steps for the reviewer, on the preview link above. -->

1.

## Screenshots

<!-- Required for visual changes: desktop and mobile. Delete if not applicable. -->

## Checklist

- [ ] Branch name and title follow the conventions in `AGENTS.md`
- [ ] Every commit is atomic and passes `npm run lint && npm run typecheck && npm test`
- [ ] Fixups are squashed and the branch is rebased on `main`
- [ ] Tests and documentation are updated with the change
- [ ] Preview link and the pages under "Review this" added above and checked, desktop and mobile
- [ ] No secrets or tokens in the diff
