#!/bin/sh
# Runs the visual tests in the same Playwright image that CI uses, so screenshots match.
# Pass --update to write new baselines.
set -e
IMAGE=mcr.microsoft.com/playwright:v1.63.0-noble
docker run --rm --ipc=host \
  -v "$PWD":/work \
  -v wherewalk-visual-node-modules:/work/node_modules \
  -v wherewalk-visual-pnpm-store:/pnpm-store \
  -e npm_config_store_dir=/pnpm-store \
  -w /work \
  -e CI=1 \
  "$IMAGE" \
  sh -c "npx -y pnpm@11.13.0 install --frozen-lockfile >/dev/null && npx -y pnpm@11.13.0 exec vitest run --project visual $*"
