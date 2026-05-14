# Contributing

The full authoring contract is in [`AGENTS.md`](./AGENTS.md). Read it first.

## Local checks

```bash
pnpm install
pnpm run validate       # frontmatter, folder names, body size, trigger phrases
pnpm run check-links    # relative + v3-docs links
pnpm test               # unit tests for the toolchain
```

All three must pass before opening a PR.

## Adding a skill

1. Copy `skills/_template/` to `skills/<your-skill-name>/`.
2. Edit `SKILL.md`: update `name` (must match folder), `description` (>=2 trigger phrases), `metadata`.
3. Write the body. Keep it under 8 KB. Move overflow into `references/`.
4. Add `references/eval-cases.md` with 3-5 prompts to run against an agent.
5. Run the local checks.
6. Open a PR. Describe the skill in two sentences in the PR body.

## Reporting an issue

Open a GitHub issue using one of the templates. See `.github/ISSUE_TEMPLATE/` (plan 07).
