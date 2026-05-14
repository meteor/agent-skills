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

## Smoke test against a local agent

Once your skill validates, install it into a local agent and run the eval
cases against a real LLM.

```bash
# From the meteor/agent-skills repo root
npx skills add ./ --skill <your-skill-name>

# Open a project that uses Claude Code (or Cursor / Codex / etc.).
# Run each prompt in references/eval-cases.md by hand.
# Mark pass/fail in the PR description.
```

The PR is not ready to merge until every eval case passes for at least two
distinct agents.

## Reporting an issue

Open a GitHub issue using one of the templates. See `.github/ISSUE_TEMPLATE/` (plan 07).
