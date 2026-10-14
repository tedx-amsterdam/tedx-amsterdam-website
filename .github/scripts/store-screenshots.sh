#!/usr/bin/env bash
# Replaces one pull request's folder on the screenshot storage branch with
# new screenshots, or removes it when no source is given. The branch always
# holds a single commit: each run writes a fresh commit with the current
# folders and force pushes it, so old screenshots leave no history behind.
#
# Usage: store-screenshots.sh <folder> [<source dir>]
# Runs inside a checkout whose origin can be pushed to; reads STORAGE_BRANCH.

set -euo pipefail

folder="$1"
source="${2:-}"
branch="${STORAGE_BRANCH:?STORAGE_BRANCH is not set}"
work="$(mktemp -d)"

# The full ref: a bare name also matches branches ending in it, such as
# chore/pr-screenshots.
if git ls-remote --exit-code origin "refs/heads/$branch" > /dev/null; then
  git fetch --quiet --depth 1 origin "refs/heads/$branch"
  git worktree add --quiet --detach "$work" FETCH_HEAD
else
  git worktree add --quiet --detach "$work"
  git -C "$work" rm -r --quiet --force --ignore-unmatch .
fi

rm -rf "${work:?}/${folder}"
if [[ -n "$source" ]]; then
  mkdir -p "$work/$folder"
  cp "$source"/* "$work/$folder/"
fi

git -C "$work" add --all
tree="$(git -C "$work" write-tree)"
commit="$(git -C "$work" \
  -c user.name="github-actions[bot]" \
  -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
  commit-tree "$tree" -m "Screenshots of open pull requests")"
git push --quiet --force origin "$commit:refs/heads/$branch"
git worktree remove --force "$work"
