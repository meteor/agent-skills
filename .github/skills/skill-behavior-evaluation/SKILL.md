---
name: skill-behavior-evaluation
description: Use when testing a new or changed Meteor skill, checking routing boundaries, or reproducing a behavioral regression. Runs only affected current-skill cases in fresh workspaces and grades observable outcomes.
---

# Evaluate Meteor skill behavior

Test whether the current skill produces the expected result. Keep the workflow focused on present behavior. Repository validation checks the case definitions; a maintainer runs the model cases.

## When to run cases

Run affected cases when a change:

- adds a published skill;
- changes a description or routing boundary;
- changes a version-sensitive decision, security rule, migration path, or scaffold;
- fixes an observed behavioral failure.

For wording, links, formatting, or factual source updates that do not change guidance, run repository validation without a model case.

## Prepare

1. Read `AGENTS.md`, the target skill, and its complete `references/eval-cases.md`.
2. Use `evaluations/skills/<skill>/cases.json` for central regression cases only. Keep the complete case inventory in the published skill.
3. Give each machine-readable case an exact `case_ref` to its canonical `## Case N: ...` heading.
4. Use an advisory case for decisions and explanations. Use a workspace case when files or commands provide the expected evidence.
5. Add a small fixture under `evaluations/fixtures/` only for a workspace case.
6. Keep generated workspaces, responses, and command output under ignored `evaluations/.work/`.

## Design a useful case

Create a case only when it can catch a meaningful failure that static validation cannot:

- insecure or incomplete generated code;
- a missed async caller or runtime boundary;
- guidance applied to an unsupported Meteor or package version;
- a previously observed regression;
- selection of a plausible but incorrect neighboring skill.

Start from a realistic user request. Add two to eight observable assertions and use response, file, or command evidence according to the expected result. Prefer one central case and one important boundary over many similar prompts. Do not test exact wording unless wording is the required behavior.

Examples:

| Case | Useful assertions |
|---|---|
| Secure an insecure Meteor method fixture | Validate complete input, require `this.userId`, derive ownership server-side, use async Mongo, and parse successfully |
| Migrate a synchronous Mongo read | Use the async API, await before property access, propagate through callers, and preserve the result shape |
| Test a capability version floor | Select the supported API on the new release and give a compatible fallback on the earlier release |
| Test overlapping skill descriptions | Select the owner as primary, allow only useful secondary skills, and forbid plausible wrong neighbors |

## Run an affected case

1. Create a fresh work directory from the fixture, or an empty directory for an advisory case.
2. Install or load the current skill.
3. Give the agent the case prompt and stated Meteor context.
4. Do not expose assertions or reviewer notes before the run finishes.
5. Preserve the response and any changed files under `evaluations/.work/` while reviewing the result.
6. Check every assertion from observable response, file, or command evidence.
7. Rerun only when the skill, case, fixture, or execution setup changes.

Never reuse a mutated workspace for another run.

## Test routing

When a skill name, description, ownership boundary, or handoff changes:

1. Update only the affected prompts in `evaluations/routing/cases.json`.
2. Run each prompt with the same available skill catalog.
3. Check the expected primary skill, allowed secondary skills, forbidden skills, and handoff behavior.
4. Fix the description or routing case according to the observed cause.

## Diagnose a failure

| Result | Meaning | Next action |
|---|---|---|
| `skill-gap` | The current skill lacks, hides, or misroutes required guidance. | Return the confirmed finding to `skill-maintenance`. |
| `evaluation-gap` | The prompt or assertion expresses the wrong expected behavior. | Correct the case from authoritative evidence, then rerun it. |
| `harness-gap` | Installation, isolation, fixture setup, execution, or evidence capture failed. | Repair the setup and discard the invalid run. |
| `no-gap` | The current skill meets the case. | Finish repository validation. |
| `inconclusive` | The evidence does not identify the cause. | Narrow the case or collect stronger evidence. |

Do not weaken an assertion to make a run pass. Change it only when authoritative evidence shows that the expected behavior was wrong.

## Finish

Run:

```bash
pnpm run validate:evaluations
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
```

Record the cases run, pass or fail outcomes, failures fixed, and remaining limitations in the PR or review. Do not commit generated workspaces or raw model output. Confirm that `.github/skills/` and `evaluations/` are absent from release ZIPs.
