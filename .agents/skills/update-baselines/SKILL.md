---
name: update-baselines
description: Update visual screenshot baselines after a planned visual change, safely. Use when pnpm test:visual fails, or after a change to how something looks.
---

# Update visual baselines

A failing screenshot is a bug until you can say why the change is right.

1. Run `pnpm test:visual`. Note the stories that fail.
2. Open each diff in `.vitest-attachments/`. Red pixels are real differences.
3. Unplanned change? Stop. Find the cause and fix the code.
4. Planned change? Update only those stories:
   `pnpm test:visual:update <story file>`
5. Open each new baseline in `.storybook/__screenshots__/`. Check it by eye.
6. Run `pnpm test:visual`. All must pass.
7. Commit the baselines with the code change. The commit body lists the stories and why they changed.

Never run `pnpm test:visual:update` with no path to make CI green.
Never update baselines outside Docker. macOS screenshots do not match CI.
