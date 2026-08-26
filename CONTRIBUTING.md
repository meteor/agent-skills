# Contributing

The full authoring contract is in [`AGENTS.md`](./AGENTS.md). Read it first.

## Maintaining existing skills

Use [`skill-gap-audit`](./.github/skills/skill-gap-audit/SKILL.md) to compare the catalog with a Meteor checkout and produce a read-only evidence report. Use [`skill-maintenance`](./.github/skills/skill-maintenance/SKILL.md) only after implementation is requested. An explicit audit-and-fix request may use the workflows in sequence, with the audit preserved before edits begin.

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
> Verify Meteor sources, update affected cases,
> and run the checks proportional to the behavioral risk. Do not commit or push
> unless requested.

Test changed behavior:

> Run the affected cases from `<skill>/references/eval-cases.md` with the current
> skill. Use a fresh conversation or disposable project for each prompt. Check
> the documented pass and fail conditions after the run, diagnose failures, and
> report the results.

The [maintenance verification guide](./docs/maintenance-verification.md)
contains additional task recipes, commands, expected outcomes, and failure
diagnosis.

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm run validate       # skills, audits, and required evaluation-case files
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
5. Run the central behavior and routing prompts in fresh conversations or disposable projects.
6. Run the local checks.
7. Open a PR. Describe the skill in two sentences in the PR body.

Agent prompt:

> Use `skill-maintenance` to create `<skill-name>` for `<user-outcome>`. Inspect
> neighboring skills and bundles, keep the scope distinct, add canonical and
> realistic evaluation cases, and test routing and behavior with affected
> prompts. Do not create the skill if an existing one already owns the outcome.

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

Do not expose the documented pass and fail conditions until the run ends. Keep
temporary projects and raw output outside this repository. Record each affected
case and its pass or fail result in the PR.

For a new skill, routing change, or high-risk guidance change, ask an outside
contributor to run the affected cases against Claude Code or Cursor and record
the results in the PR. Static CI validates that case files exist but does not
invoke a model.

## Reporting an issue

Open a GitHub issue with the skill name, agent client, model, prompt, observed
result, and expected result.
