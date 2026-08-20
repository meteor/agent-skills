# Contributing

The full authoring contract is in [`AGENTS.md`](./AGENTS.md). Read it first.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm run validate       # metadata, consistency, body size, trigger phrases
pnpm run check-links    # relative + v3-docs links
pnpm run catalog:check  # README catalog and bundles
pnpm test               # unit tests for the toolchain
pnpm run build:zips     # release artifacts
```

All checks must pass before opening a PR.

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

The PR is not ready to merge until an outside contributor runs every eval
case against Claude Code or Cursor and records the results in the PR.

## Reporting an issue

Open a GitHub issue with the skill name, agent client, model, prompt, observed
result, and expected result.
