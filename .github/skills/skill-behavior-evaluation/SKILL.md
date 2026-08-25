---
name: skill-behavior-evaluation
description: Use when behaviorally evaluating a new or changed Meteor skill, comparing it with no skill or a previous revision, testing routing boundaries, or diagnosing whether a failure belongs to the skill, evaluation, or harness.
---

# Evaluate Meteor skill behavior

Evaluate observable outcomes from isolated Meteor scenarios. Static validation proves that the repository contract is coherent. This workflow tests whether a skill changes an agent's decisions and implementation quality.

## Use this workflow selectively

Run a behavioral evaluation when a change does at least one of these:

- adds a published skill;
- changes a description or routing boundary;
- changes a version-sensitive decision, security rule, migration path, or scaffold;
- fixes a previously observed behavioral failure;
- supports a reliability, time, or token claim.

For wording, links, formatting, or source-refresh edits that do not change guidance, maintain the canonical manual cases and run repository validation. Do not require a model run only because a file changed.

## Select the evaluation level

| Need | Run | Evidence |
|---|---|---|
| Fast behavioral check | One `current-skill` smoke run | Response, changed files, and deterministic commands |
| Prove skill value | Matched `current-skill` and `without-skill` runs | Same prompt, fixture digest, assertions, client, model, and Meteor context |
| Check a maintenance regression | Add a `previous-skill` run | Exact previous skill revision plus the matched conditions |
| Claim reliability, time, or tokens | Repeat every compared condition at least three times | Per-run outcomes and measurements |
| Check skill selection | Routing suite | Primary, allowed secondary, forbidden skill, and expected handoff behavior |

One run is evidence for a smoke check, not a reliability claim.

## Prepare

1. Read `AGENTS.md`, the target skill, and its complete `references/eval-cases.md`.
2. Read `references/evaluation-contract.md` before creating or changing a suite.
3. Use `evaluations/skills/<skill>/cases.json` as a representative subset. Keep the complete manual case inventory in the published skill.
4. Snapshot the exact suite before a run with `pnpm run evaluation:snapshot-suite -- evaluations/skills/<skill>/cases.json`.
5. Give every machine-readable case an exact `case_ref` to its canonical `## Case N: ...` heading.
6. Use an advisory case for reasoning and recommendations. Use a workspace case when changed files or commands provide stronger evidence.
7. Put small, reviewable starting workspaces under `evaluations/fixtures/`. Keep generated copies and raw transcripts under ignored `evaluations/.work/`.

## Execute an isolated run

For each case and condition:

1. Create a fresh work directory from the same committed fixture.
2. Record the canonical starting digest with `pnpm run evaluation:hash-fixture -- <directory>`. Advisory cases use the empty-workspace digest defined by the same helper.
3. Apply only the condition under test: current skill, no skill, or an exact previous skill revision.
4. Keep the prompt, Meteor context, client, model, and available project files fixed.
5. Do not expose expected assertions, reviewer notes, or another run's output to the agent.
6. Preserve the response, final file tree, command output, elapsed time, and token counts when available.
7. Grade every assertion from observable evidence. Do not grade writing style or require exact wording unless wording is the behavior under test.

Never reuse a mutated workspace across conditions or repetitions.

## Diagnose before editing

| Classification | Meaning | Next action |
|---|---|---|
| `skill-gap` | The skill lacks, obscures, or misroutes required guidance. | Return the confirmed finding to `skill-maintenance`. |
| `evaluation-gap` | The prompt or assertion does not represent the intended outcome. | Repair the suite and rerun affected conditions. |
| `harness-gap` | Isolation, installation, fixture, grading, or evidence capture failed. | Repair the harness and discard invalid runs. |
| `no-gap` | Observable behavior meets the suite. | Record the supported scope without broad claims. |
| `inconclusive` | Evidence cannot distinguish the cause. | Narrow the case or collect stronger evidence. |

Do not weaken an assertion to make a run pass. Change it only when the assertion is not a valid expression of the canonical case.

## Record evidence

Use `references/report-template.md` to create a dated JSON report under `evaluations/reports/` only after real runs exist. Reports are maintenance evidence, not distributable skill content.

Run:

```bash
pnpm run evaluation:snapshot-suite -- evaluations/skills/<skill>/cases.json
pnpm run evaluation:hash-fixture -- evaluations/fixtures/<skill>/<case>
pnpm run validate:evaluations
pnpm run validate
pnpm test
pnpm run build:zips
```

Confirm that `.github/skills/`, `evaluations/`, and raw work artifacts are absent from release ZIPs. Report the tested client, model, skill revision, Meteor revision and release, conditions, repetitions, failures, and limitations.
