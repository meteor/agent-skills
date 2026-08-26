# Maintenance verification guide

Use this guide when changing a published skill or preparing a contribution.
Verify the current guidance, run the behavior that changed, and inspect the
release ZIP.

## Required workflow

1. Verify changed facts against Meteor documentation or source.
2. Update the skill and bump `metadata.version` for meaningful guidance changes.
3. Update `references/eval-cases.md` when expected behavior changes.
4. Run only the affected prompts in fresh conversations or disposable projects.
5. Run repository validation and inspect changed ZIPs.

The changed skill and its current cases define the expectation. Git history
preserves earlier revisions.

## Why keep cases

Static checks prove that a skill is well formed, linked, and packaged. They
cannot prove that an agent applies its guidance to a realistic request. An
evaluation case provides a user prompt and observable pass and fail conditions.

Keep a case when it catches a meaningful failure that static checks cannot:

| Example | What the case catches |
|---|---|
| Secure a Meteor method | Code that parses but trusts caller ownership, skips authentication, or uses the wrong Mongo API |
| Ask for an async rate-limit matcher on Meteor 3.5 and a fallback on 3.4.1 | Guidance that silently applies a newer capability to an older release |
| Migrate a synchronous Mongo read through its caller chain | An API rename that leaves callers using unresolved Promises |
| Ask for React SVG support under Rspack | Selection of a plausible neighboring skill that does not own the main outcome |

Use this prompt when adding coverage:

> Add the smallest case to `skills/<name>/references/eval-cases.md` for
> `<behavior or observed failure>`. Start from a realistic user request, state
> relevant Meteor or package versions, and define observable pass and fail
> conditions. Add an earlier-version or routing near miss only when it protects
> a real boundary. Explain what the case catches that static validation cannot.

Do not add cases only to restate paragraphs, preserve preferred wording, or
cover speculative edge cases.

## Choose the checks

| Change | Required verification |
|---|---|
| Spelling, formatting, or link repair | Static checks |
| Factual clarification with no decision change | Source review and static checks |
| Guidance or scaffold change | Affected manual cases and static checks |
| Skill description or routing change | Positive and near-miss selection prompts plus static checks |
| Meteor or package version boundary | Supported-version prompt, earlier-version near miss, and static checks |
| New skill | Canonical cases, selection prompts, smoke runs, and static checks |
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
scaffolds, or an observed failure.

1. Add or update the smallest relevant case in
   `skills/<skill>/references/eval-cases.md`.
2. Run the prompt with the current skill in a fresh conversation or disposable
   project.
3. Hide the pass and fail conditions until the run finishes.
4. Correct the skill or case according to the observed cause.
5. Rerun the affected prompt, then run static checks.

Prompt:

> Run the affected cases from `<skill>/references/eval-cases.md` with the
> current skill. Use a fresh conversation or disposable project for each case.
> Check the documented pass and fail conditions after each run, diagnose any
> failure, and report the outcomes. Do not run unrelated cases.

## Routing change

Use this when a skill name, description, ownership boundary, or handoff changes.

1. Add a positive prompt to the owning skill's `references/eval-cases.md`.
2. Add a near-miss prompt when a neighboring skill could plausibly own the
   request.
3. Run each prompt with the same installed catalog and confirm the intended
   primary skill and handoff.
4. Correct the description or expected route according to the observed cause.

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
2. Add realistic positive, failure, and near-miss prompts to
   `references/eval-cases.md`.
3. Run the central behavior and selection prompts.
4. Run the full repository checks and inspect the ZIP.

## Diagnose a failed case

| Result | Meaning | Next action |
|---|---|---|
| Skill gap | Current guidance is missing, unclear, or misrouted | Update the skill |
| Case gap | The prompt or expected result is wrong | Correct the case from authoritative evidence |
| Setup gap | Installation, project setup, execution, or capture failed | Repair the test setup |
| Pass | Current behavior meets the case | Continue to repository validation |
| Inconclusive | Evidence cannot identify the cause | Narrow the case or collect stronger evidence |

Never weaken a condition only to make a run pass. Keep temporary projects and
raw model output outside the repository. Record affected case outcomes in the
PR or review.

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

Then inspect changed ZIP contents, record the manual cases run, and list known
limitations.

## Command map

| Command | What it verifies |
|---|---|
| `pnpm run validate` | Skill metadata, body limits, required case files, allowed files, and audit records |
| `pnpm run check-links` | Relative links and Meteor `v3-docs` paths |
| `pnpm run catalog:check` | Generated README catalog and bundles |
| `pnpm test` | Repository validators and helper scripts |
| `pnpm run build:zips` | Published skill archives |

Static checks prove repository consistency. Manual cases test agent outcomes.
ZIP inspection tests packaging.

## Detailed references

- [`AGENTS.md`](../AGENTS.md): normative authoring contract.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md): contribution workflow.
- [`RELEASING.md`](../RELEASING.md): release checklist.
- [`skill-maintenance`](../.github/skills/skill-maintenance/SKILL.md)
- [`skill-gap-audit`](../.github/skills/skill-gap-audit/SKILL.md)
