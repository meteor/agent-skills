# Contributing

The full authoring contract is in [`AGENTS.md`](./AGENTS.md). Read it first.

## Maintaining existing skills

Use [`skill-gap-audit`](./.github/skills/skill-gap-audit/SKILL.md) to compare the catalog with a Meteor checkout and produce a read-only evidence report. Use [`skill-maintenance`](./.github/skills/skill-maintenance/SKILL.md) only after implementation is requested. Use [`skill-behavior-evaluation`](./.github/skills/skill-behavior-evaluation/SKILL.md) for new skills, routing changes, high-risk guidance, matched comparisons, or behavioral regressions. An explicit audit-and-fix request may use the workflows in sequence, with the audit preserved before edits begin.

Store committed audit records under `audits/skill-gaps/`. Do not overwrite an earlier audit. A new audit records its predecessor and the old and new Meteor revisions so later drift checks remain reproducible.

## Ask a maintainer agent

You can give these prompts to an agent working from the repository root. Keep
the requested scope explicit and review its evidence before accepting edits.

Audit Meteor changes without editing skills:

> Use `skill-gap-audit` to compare this catalog with the current
> `meteor/meteor` `devel` revision. Prioritize `v3-docs`, verify introduction
> versions from history or package releases, and store a reproducible audit.
> Do not modify published skills.

Implement an approved contribution:

> Use `skill-maintenance` to implement `<requested-change>`. Preserve existing
> classification and routing unless the change explicitly requires them.
> Verify Meteor sources, update independent skill versions and affected cases,
> and run the checks proportional to the behavioral risk. Do not commit or push
> unless requested.

Evaluate changed behavior:

> Use `skill-behavior-evaluation` for `<skill>`. Run the affected representative
> cases in fresh workspaces, compare `current-skill` with `without-skill`, grade
> observable outcomes, and create a new snapshot and dated report. Preserve
> historical evidence.

The [maintenance verification guide](./docs/maintenance-verification.md)
contains additional task recipes, commands, expected outcomes, and failure
diagnosis.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm run validate       # skills, audits, evaluation definitions, and reports
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
4. Add `references/eval-cases.md` with realistic prompts to run against an agent.
5. Add a representative machine-readable subset under `evaluations/skills/<your-skill-name>/cases.json`, plus routing cases and small fixtures where needed.
6. Run the local checks.
7. Open a PR. Describe the skill in two sentences in the PR body.

Agent prompt:

> Use `skill-maintenance` to create `<skill-name>` for `<user-outcome>`. Inspect
> neighboring skills and bundles, keep the scope distinct, add canonical and
> representative evaluation cases, and use `skill-behavior-evaluation` to test
> routing and behavior. Do not create the skill if an existing one already owns
> the outcome.

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

Run the prompt before opening any reviewer guide under `test/evals/`. Do not
copy reviewer guides into the target project or expose them in the agent
conversation. Compare the response with the guide only after the run ends.

Machine-readable suites do not replace the complete manual cases. They select a stable representative subset, pin Meteor and package context, and grade observable response, file, or command evidence. Store generated workspaces and raw transcripts only under `evaluations/.work/`. Commit a content-addressed suite snapshot and dated report after real runs when the change needs reproducible comparison evidence.

Use one run only as a smoke check. Compare `current-skill` and `without-skill` from identical fresh fixtures to demonstrate skill value. Add an exact `previous-skill` revision for regression comparisons. Reliability, time, or token claims need at least three repetitions for every compared condition.

The PR is not ready to merge until an outside contributor runs every canonical eval case against Claude Code or Cursor and records the results in the PR. Static CI validates suites and reports but does not invoke a model.

## Reporting an issue

Open a GitHub issue with the skill name, agent client, model, prompt, observed
result, and expected result.
