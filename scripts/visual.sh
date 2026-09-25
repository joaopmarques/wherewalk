#!/bin/sh
# Runs the visual tests in the same Playwright image that CI uses, so screenshots match.
# Pass --update to write new baselines.
set -e
IMAGE=mcr.microsoft.com/playwright:v1.63.0-noble
PNPM=pnpm@11.28.0
# One node_modules volume per checkout, so two worktrees never share an install.
VOLUME="wherewalk-visual-$(printf '%s' "$PWD" | shasum | cut -c1-12)"
docker run --rm --ipc=host \
  -v "$PWD":/work \
  -v "$VOLUME":/work/node_modules \
  -v wherewalk-visual-pnpm-store:/pnpm-store \
  -w /work \
  -e CI=1 \
  "$IMAGE" \
  sh -c "npx -y $PNPM install --frozen-lockfile --store-dir /pnpm-store --reporter=silent && npx -y $PNPM exec vitest run --project visual $*"
