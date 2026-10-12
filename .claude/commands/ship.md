---
description: Check, tidy and push the current branch, then open or update its pull request
argument-hint: "[optional: base branch, default main]"
---

Get the current branch ready for review. Stop and report at the first step that fails; do not paper over a failure.

Base branch: $ARGUMENTS (use `main` if empty)

1. **Branch**: refuse to ship from `main`. The branch name follows `<type>/<description>` from `CLAUDE.md`. The working tree is clean; if not, ask what to do with the changes.
2. **Base**: `git fetch`. Do not stack while `gh api repos/{owner}/{repo} -q .delete_branch_on_merge` is `false` (decision 17): the base must be `main`. If the base is not `main`, check that the base branch has an open pull request; if it was merged or deleted, the base is `main`. Rebase on the base: `git rebase --autosquash origin/<base>`.
3. **Commits**: every commit since the base follows the commit rules in `CLAUDE.md` (Conventional Commits, scope, imperative lowercase subject within 72 characters, a body that explains why, the `Co-Authored-By` trailer). No `fix:` commit for a mistake made earlier on this branch: fold it in with `git commit --fixup` and autosquash. No secrets, tokens or `.env.local` in the diff.
4. **Checks**: run `npm run lint && npm run typecheck && npm test`. If pages, metadata, `public/` or `next.config.*` changed, also run `npm run build && npm run test:output`. Every commit must pass on its own; if a commit is suspect, check it with `git rebase --exec "npm run lint && npm run typecheck && npm test" origin/<base>`.
5. **Docs**: the change is reflected in the docs it affects, in this branch: "Now" and the phase checklist in `docs/roadmap.md`, `docs/website-spec.md`, `docs/decisions.md`, `docs/webflow-content-model.md`, `.env.example`, `CLAUDE.md`. Add missing updates as their own `docs` commits, or as fixups of the commit they belong to.
6. **Reviews**: run the project agents in parallel on `git diff origin/<base>...HEAD`: `spec-auditor` when what the build serves changed (pages, components, metadata, `public/`, `next.config.*`, the content layer) or when `docs/website-spec.md` changed, `a11y-reviewer` when anything visitors see changed, `newcomer` only when onboarding changed: `README.md`, `CLAUDE.md` rules, `.env.example`, the Node version, or how to install, run or test the site. Routine updates to the roadmap, decisions or spec status do not count. Fix blocking findings (as fixups), list the rest in the pull request.
7. **Push**: `git push --force-with-lease -u origin HEAD`. Never push to `main`.
8. **Pull request**: if none exists, create it with `gh pr create --draft --base <base>`, using `.github/pull_request_template.md`. The title follows the commit subject format. The description starts with the preview link `https://<branch>.tedx-amsterdam-website.pages.dev` (`/` and other special characters become `-`), explains what and why, links the issue and lists open review findings. Leave out tool or session footers. If the pull request is stacked, say so at the top and name the pull request that must merge first. If a pull request exists, update its description when the scope changed.
9. **CI**: wait for `gh pr checks` to finish. Compare the preview URL in the Cloudflare comment with the one in the description and fix it if they differ. Report Lighthouse and CI results.

Do not mark the pull request ready and never merge: the maintainer does both. Finish with the pull request URL, the check results, open review findings, and what the maintainer still has to do (for example merge order for stacked pull requests).
