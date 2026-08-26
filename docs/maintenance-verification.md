# Maintenance verification guide

Use this guide when changing a published skill or preparing a contribution.
The goal is simple: verify the current guidance, test the behavior that changed,
and confirm the release ZIP contains the intended files.

## Required workflow

1. Verify changed factual guidance against Meteor documentation or source.
2. Update the skill and bump `metadata.version` for meaningful behavior changes.
3. Update evaluation cases when the expected behavior changes.
4. Run only the affected cases in fresh workspaces.
5. Run repository validation and inspect changed ZIPs.

The changed skill and its current cases define the expected behavior. Git
history preserves earlier revisions.

## Why keep current cases

Static checks can prove that a skill is well formed, linked, and packaged. They
cannot prove that an agent applies its instructions to a realistic request. A
current case is an acceptance test for that behavior: it gives the agent a user
prompt, then checks observable decisions, files, or commands.

Keep a case when it protects something that could fail while every static check
still passes. Do not create cases only to restate every paragraph in a skill.

| Example | What the case catches |
|---|---|
| Secure a method from an insecure fixture | Code that parses but trusts caller ownership, skips authentication, or uses the wrong Mongo API |
| Ask for an async rate-limit matcher on Meteor 3.5 and a fallback on 3.4.1 | Guidance that silently applies a newer capability to an older Meteor release |
| Migrate a synchronous Mongo read through its caller chain | A superficial API rename that leaves callers using unresolved Promises |
| Route a React SVG request that also needs Rspack configuration | A plausible neighboring skill becoming primary and hiding the guidance that owns the user outcome |

Use this prompt when adding coverage:

> Add the smallest evaluation case for `<behavior or observed failure>`. Start
> from a realistic user request, state the relevant Meteor and package versions,
> link it to the canonical case with `case_ref`, and define only observable
> response, file, or command assertions. Use a fixture only when the result
> requires file edits. Add an earlier-version or routing near miss only when it
> protects a real boundary. Explain what the case catches that static validation
> cannot.

## Choose the checks

| Change | Required verification |
|---|---|
| Spelling, formatting, or link repair | Static checks |
| Factual clarification with no decision change | Source review and static checks |
| Guidance or scaffold change | Affected behavior cases and static checks |
| Skill description or routing change | Affected routing cases and static checks |
| Meteor or package version boundary | Supported-version case, earlier-version near miss, and static checks |
| New skill | Canonical cases, representative suite, routing cases, smoke runs, and static checks |
| New Meteor core behavior | Gap audit before any authorized skill edit |

## Documentation-only change

Use this for spelling, formatting, repaired links, or source updates that do
not change an agent decision.

```bash
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
git diff --check
```

Build and inspect ZIPs when a published skill file changed.

## Guidance change

Use this for decisions, version boundaries, security rules, migration paths,
scaffolds, or a previously observed failure.

1. Update the canonical case in
   `skills/<skill>/references/eval-cases.md` when expected behavior changed.
2. Add or update a representative case in
   `evaluations/skills/<skill>/cases.json` when it protects a central behavior
   or likely regression.
3. Add a fixture only when files or commands are part of the expected result.
4. Run the affected current-skill cases in fresh workspaces.
5. Fix the skill, case, or execution setup according to the observed cause.
6. Run the static checks.

Prompt:

> Use `skill-behavior-evaluation` for `<skill>`. Run only the affected current
> cases in fresh workspaces, grade observable outcomes, diagnose failures, and
> report the cases run and their results. Do not run unrelated cases.

## Routing change

Use this when a skill name, description, ownership boundary, or handoff
changes.

1. Update only the affected prompts in `evaluations/routing/cases.json`.
2. Run them with the same available skill catalog.
3. Check the expected primary skill, allowed secondary skills, forbidden
   skills, and handoff behavior.
4. Run the static checks.

Prompt:

> Use `skill-behavior-evaluation` to run the affected routing cases. Keep the
> prompts and available skill catalog fixed. Report incorrect selections and
> whether the skill description or routing expectation needs correction.

## New Meteor core behavior

Audit before changing published skills:

> Use `skill-gap-audit` to compare this catalog with the current
> `meteor/meteor` revision. Prioritize `v3-docs`, verify introduction versions
> from history or package releases, and preserve the read-only audit. Do not
> modify published skills.

After the user authorizes confirmed findings:

> Use `skill-maintenance` to implement only confirmed findings from
> `<audit-path>`. Update the smallest coherent skill surface, bump independent
> skill versions, maintain affected cases, and run the checks required for the
> changed behavior.

## New skill

Follow [`CONTRIBUTING.md`](../CONTRIBUTING.md) and start from
`skills/_template/`.

1. Define one user outcome and its routing boundary.
2. Add complete canonical cases under the published skill.
3. Add central representative cases under `evaluations/skills/`.
4. Add positive and near-miss routing cases.
5. Run the representative behavior and routing cases.
6. Run the full repository checks and inspect the ZIP.

## Evaluation files

| Path | Purpose |
|---|---|
| `skills/<name>/references/eval-cases.md` | Complete manual case inventory shipped with the skill |
| `evaluations/skills/<name>/cases.json` | Small representative regression suite |
| `evaluations/fixtures/` | Starting files for workspace cases |
| `evaluations/routing/cases.json` | Skill selection and handoff cases |
| `evaluations/.work/` | Ignored temporary workspaces and raw output |

Machine-readable cases link to a canonical heading through `case_ref`. An
advisory case checks the response. A workspace case checks changed files or a
deterministic command.

Add a case for:

- a new user-visible decision or scaffold;
- a Meteor or package version boundary;
- a security, data-loss, deployment, or migration risk;
- an observed failure not covered by an existing case;
- a routing overlap;
- a file or command contract that can be checked directly.

Do not add a case for wording-only edits, duplicate examples of the same
behavior, or speculative edge cases with little regression risk.

## Run a behavior case

1. Create a fresh workspace from the fixture, or an empty workspace for an
   advisory case.
2. Load the current skill.
3. Give the agent the case prompt and Meteor context without exposing the
   assertions.
4. Save temporary output under `evaluations/.work/` while reviewing it.
5. Check each response, file, and command assertion.
6. Correct the identified cause and rerun only the affected case.

| Result | Meaning | Next action |
|---|---|---|
| `skill-gap` | Current guidance is missing, unclear, or misrouted | Update the skill |
| `evaluation-gap` | The case expresses the wrong expected behavior | Correct the case from authoritative evidence |
| `harness-gap` | Setup, isolation, installation, or capture failed | Repair the run setup |
| `no-gap` | Current behavior meets the case | Continue to repository validation |
| `inconclusive` | Evidence cannot identify the cause | Narrow the case or collect stronger evidence |

Never weaken an assertion only to make a run pass.

## Final contribution review

Run:

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
git diff --check
```

Then:

1. Inspect changed ZIP contents.
2. Confirm maintainer files and `evaluations/` are absent from ZIPs.
3. Record the behavior cases run and their pass or fail results in the PR.
4. List known limitations.

## Command map

| Command | What it verifies |
|---|---|
| `pnpm run validate:skills` | Skill metadata, body limits, allowed files, and audit records |
| `pnpm run validate:evaluations` | Representative suites, fixtures, routing, and cross-references |
| `pnpm run validate` | Both static validation layers |
| `pnpm run check-links` | Relative links and Meteor `v3-docs` paths |
| `pnpm run catalog:check` | Generated README catalog and bundles |
| `pnpm test` | Repository validators and helper scripts |
| `pnpm run build:zips` | Published skill archives |

Static checks prove repository consistency. Behavior cases test agent outcomes.
ZIP inspection tests packaging.

## Detailed references

- [`AGENTS.md`](../AGENTS.md): normative authoring contract.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md): contribution workflow.
- [`RELEASING.md`](../RELEASING.md): release checklist.
- [`skill-maintenance`](../.github/skills/skill-maintenance/SKILL.md)
- [`skill-gap-audit`](../.github/skills/skill-gap-audit/SKILL.md)
- [`skill-behavior-evaluation`](../.github/skills/skill-behavior-evaluation/SKILL.md)
