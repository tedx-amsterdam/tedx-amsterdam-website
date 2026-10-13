#!/usr/bin/env bash
# Runs the Lighthouse checks from CI (lighthouserc.json) on your machine,
# so a failure shows up before you push instead of on the pull request.
#
# Usage:
#   npm run lighthouse              the build in out/ (run npm run build first)
#   npm run lighthouse -- <url>     a deployment, such as your branch preview
#
# Build with CONTENT_SOURCE=webflow to test real content: fixture images are
# inline placeholders, so the performance score of a fixture build is too
# optimistic. Scores also vary with your machine and network; a pass here
# makes a pass in CI likely, not certain.
# Requires: Google Chrome. Reports go to .lighthouseci/ (git ignored).

set -euo pipefail

base="${1:-}"
ext=""
args=()

if [[ -z $base ]]; then
  if [[ ! -f out/speakers.html ]]; then
    echo "No build in out/. Run npm run build first, or pass a URL." >&2
    exit 1
  fi
  # Lighthouse CI serves out/ itself on a local port. Its server has no
  # clean URLs like Cloudflare, so pages are requested with .html.
  args+=(--collect.staticDistDir=out)
  base="http://localhost"
  ext=".html"
  speakers_html="$(cat out/speakers.html)"
else
  base="${base%/}"
  speakers_html="$(curl -fsSL "$base/speakers")"
fi

# The same page types as .github/workflows/lighthouse.yml: the first
# speaker the overview links to, since speakers come and go in the CMS.
if [[ $speakers_html =~ href=\"(/speakers/[a-z0-9-]+)\" ]]; then
  speaker="${BASH_REMATCH[1]}"
else
  echo "No speaker detail link found on /speakers" >&2
  exit 1
fi

args+=(--collect.url="$base/")
for path in /events /speakers "$speaker"; do
  args+=(--collect.url="$base$path$ext")
done

rm -rf .lighthouseci
status=0
npx --yes @lhci/cli@0.15.1 autorun \
  --config=lighthouserc.json \
  "${args[@]}" \
  --upload.target=filesystem \
  --upload.outputDir=.lighthouseci/reports || status=$?

# Scores of the median run per page, the run the thresholds are checked on.
node -e '
const runs = require("./.lighthouseci/reports/manifest.json").filter((run) => run.isRepresentativeRun);
for (const { url, summary } of runs) {
  const scores = Object.entries(summary).map(([name, score]) => `${name} ${score.toFixed(2)}`);
  console.log(`${new URL(url).pathname.padEnd(40)} ${scores.join("  ")}`);
}
' 2>/dev/null || true
exit "$status"
