#!/usr/bin/env bash
# Waits for the Cloudflare Pages check run on a commit and prints the
# commit specific preview URL. Cloudflare reports deployments as a check
# run with the URL in its summary, not as a GitHub deployment.
#
# Usage: cloudflare-preview-url.sh <owner/repo> <sha>
# Requires: gh (authenticated through GH_TOKEN), jq

set -euo pipefail

repo="$1"
sha="$2"
timeout_seconds="${PREVIEW_TIMEOUT_SECONDS:-600}"
interval_seconds=15
elapsed=0

while (( elapsed < timeout_seconds )); do
  run="$(gh api "repos/${repo}/commits/${sha}/check-runs" \
    --jq '[.check_runs[] | select(.app.slug == "cloudflare-workers-and-pages")] | first // empty')"

  if [[ -n "$run" ]]; then
    status="$(jq -r '.status' <<< "$run")"
    conclusion="$(jq -r '.conclusion' <<< "$run")"

    if [[ "$status" == "completed" ]]; then
      if [[ "$conclusion" != "success" ]]; then
        echo "Cloudflare deployment finished with conclusion: ${conclusion}" >&2
        exit 1
      fi
      url="$(jq -r '.output.summary' <<< "$run" \
        | grep -oE 'https://[a-f0-9]{8}\.[a-z0-9-]+\.pages\.dev' | head -n 1)"
      if [[ -z "$url" ]]; then
        echo "No preview URL found in the Cloudflare check run summary" >&2
        exit 1
      fi
      echo "$url"
      exit 0
    fi
  fi

  sleep "$interval_seconds"
  elapsed=$(( elapsed + interval_seconds ))
done

echo "Timed out after ${timeout_seconds}s waiting for the Cloudflare deployment" >&2
exit 1
