#!/bin/bash
# Wekelijkse data-update: scrape → commit → push (Vercel deployt daarna zelf).
#
# Draait via launchd op deze Mac (zie nl.kaderstudios.scrape.plist) omdat
# Gearbookers WAF datacenter-IP's blokkeert — GitHub Actions krijgt 403,
# een residentieel IP niet. Handmatig draaien kan ook: pnpm data:update
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
NODE="/Users/mikeschaper/.nvm/versions/node/v22.22.0/bin/node"

cd "$(dirname "$0")/.."

echo "[$(date '+%Y-%m-%d %H:%M')] scrape gestart"
"$NODE" scripts/scrape-studios.mjs

if [ -n "$(git status --porcelain data/)" ]; then
  git add data/
  git commit -m "data: wekelijkse her-scrape ($(date '+%Y-%m-%d'))"
  git push origin main
  echo "[$(date '+%Y-%m-%d %H:%M')] data bijgewerkt en gepusht — Vercel deployt"
else
  echo "[$(date '+%Y-%m-%d %H:%M')] geen wijzigingen"
fi
