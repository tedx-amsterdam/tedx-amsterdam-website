---
description: Work out the next unit of work from the roadmap and propose how to start it
argument-hint: "[optional: a specific task or phase]"
---

Find out what to work on next and propose a plan. Do not write code or create branches yet.

Focus: $ARGUMENTS

1. Read "Now", "Open decisions" and "Maintainer actions" in `docs/roadmap.md`, then the phase that "Now" points to.
2. Check the real state, because "Now" can be stale:
   - `git status` and `git branch --show-current`: uncommitted work or an unfinished branch comes first.
   - `git fetch` and `git log --oneline -10 origin/main`.
   - `gh pr list --state open` with each pull request's base branch. A stacked pull request whose base is not `main` must wait for the one below it.
   - Pull requests merged since "Now" was written: `gh pr list --state merged --limit 10 --json number,title,baseRefName`. Any merged into a branch other than `main` never reached `main`: report it as the first thing to fix.
3. If "Now" and the real state disagree, say how, and include updating "Now" in the plan.
4. Pick the next unit of work: one pull request, as described in the roadmap. If a focus was given above, use it. Skip work that is blocked by an open decision or a maintainer action, and say which one blocks it.
5. Read what the task needs before planning: `docs/decisions.md` for architecture or tooling, `docs/webflow-content-model.md` for `src/content/`, `docs/current-site.md` for URLs and designs. Look up the spec requirements that apply with the `specification-website` MCP tools.

Reply in the language of the conversation with:

- **State**: two or three lines, including anything out of date or broken.
- **Next**: the pull request, its branch name (`<type>/<description>`) and its base branch.
- **Plan**: the commits in order, each with a Conventional Commits subject. Tests and docs travel with the change.
- **Blocked by**: open decisions or maintainer actions to settle first, or "nothing".
- **Questions**: only decisions that belong to the maintainer or the foundation.

Then wait for the go ahead.
