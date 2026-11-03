#!/usr/bin/env bash
# ddanghnl-site: put this site into the repo that Cloudflare Pages deploys to ddanghnl.com
# (../portfolio, github.com/ddangdev/portfolio: the old studio site's repo, kept because the Pages
# project, its custom domain and its secrets hang off it). Copies the source over, leaves the Pages
# function (functions/api/lead.js, the lead endpoint with Turnstile and Resend, for when the contact
# form posts to it) and the licence, and builds there to prove it. It does not commit or push: look
# at `git status` in ../portfolio, then commit and push, and Pages builds from main.
#
#   scripts/release.sh
#
# The working copy stays here: edit in ddanghnl-site, release to portfolio. (2026-11-02)
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
live="$here/../portfolio"
[ -d "$live/.git" ] || { echo "no live repo at $live"; exit 1; }

# the old site's source goes; the new one comes
rm -rf "$live/src" "$live/public" "$live/tests" "$live/email" "$live/scripts"
rm -f "$live/eslint.config.js" "$live/index.html" "$live/vite.config.js"
cp -r "$here/src" "$here/public" "$here/email" "$here/scripts" "$live/"
cp "$here/index.html" "$here/vite.config.js" "$here/package.json" "$here/package-lock.json" "$here/README.md" "$here/.env.production" "$here/.env.example" "$live/"
# the live repo's ignores: this site's, plus wrangler's local files
{ cat "$here/.gitignore"; printf '\n# wrangler, local\n.dev.vars\n.wrangler/\n'; } > "$live/.gitignore"

cd "$live"
npm install --no-audit --no-fund --silent
npx vite build
echo "released to $live - now: git status, commit, push"
