# Visual baselines from Docker, not Chromatic

Screenshot tests use Vitest's `toMatchScreenshot`, with baselines committed in the repo. Chromatic would add an account and an outside service to an app that has none. Screenshots differ between operating systems, so baselines come only from the Playwright Docker image that CI also uses. That is why `pnpm test:visual` needs Docker.
