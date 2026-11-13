---
name: skill-maintenance
description: Use when creating, reviewing, or updating a published skill in meteor/agent-skills, including applying confirmed skill-gap audit findings. Preserves repository conventions, distributable format, factual evidence, routing boundaries, references, metadata, and manual behavior cases.
metadata:
  internal: true
---

# Maintain Meteor agent skills

Create verifiable Meteor application skills. Preserve the repository contract
and focus on application decisions.

## Scope

Published skills live under `skills/`. Maintainer workflows live under `.github/skills/` and are not release artifacts.

Before editing:

1. Read `AGENTS.md` completely.
2. Read `templates/SKILL.template.md` for a new skill.
3. Read the target skill, its references, and its evaluation cases for an update.
4. Inspect neighboring skills before changing routing or scope.

Do not copy maintainer skills from a Meteor source checkout into the public catalog. They describe framework contributor workflows, while this repository serves application developers.

## Resolve a Meteor checkout

Resolve a checkout only when factual verification needs Meteor documentation, source, or tests.

1. Prefer a path supplied by the user or task.
2. Otherwise, use `METEOR_CHECKOUT` when it is set.
3. Otherwise, inspect accessible workspace roots and direct sibling directories for candidates.
4. Validate a candidate with `git -C <path> rev-parse --show-toplevel`. Confirm that `v3-docs/`, `packages/`, and `tools/` exist. Prefer a Git remote that points to `meteor/meteor`; allow a fork when its upstream or structure is clear.
5. Use an automatically discovered path only when exactly one candidate is credible. Report the resolved path.
6. If no candidate or multiple candidates remain, ask the user for the Meteor checkout path. Do not clone a repository without authorization.

Never embed a machine-specific checkout path in a published skill.

## Evidence order

Use evidence in this order:

1. Current Meteor 3 documentation under the resolved checkout's `v3-docs/`.
2. Meteor implementation and tests when documentation is ambiguous.
3. Meteor checkout skills as navigation and maintenance guidance.
4. Official release notes and pull requests for version-specific context.
5. Community material only as labeled supporting context.

Record the Meteor Git remote, commit SHA, branch, and dirty state during factual reviews. A date alone is not a reproducible documentation revision.

Current `devel` docs prove current behavior, not introduction. Verify a feature
floor in versioned `v3-docs`, an official changelog, a release tag, or Git
history. For package APIs, use package history and the resolved package version.

## Authoring workflow

1. Define the user outcome and neighboring exclusions. Map advertised capabilities to instructions and cases.
2. Keep essential decisions in `SKILL.md`, conditional detail in references, and repeated deterministic work in scripts.
3. Preserve `AGENTS.md` conventions. Keep audit reports, raw results and reviewer-only solutions outside distributable folders.
4. Update `docs_synced_at` only after checking current documentation. Regenerate the catalog when names, taglines or bundles change.
5. Follow the evaluation and validation sections below before reporting completion.

## Keep updates proportional

For each addition, name the user task/symptom and the decision it changes.
Keep release history and internals with no changed action in docs/audit notes.
Especially for patches, correct existing rules instead of appending release
summaries or updating every skill. Retain security warnings, package boundaries
and older-version fallbacks that prevent concrete mistakes, regardless of
release size.

Consolidate repetition. Keep capability floors and inspect resolved packages
to select them; read runtime metadata instead of duplicating exact runtime pins.
Keep partial installations useful: required setup
must not depend on an unavailable sibling skill.

Briefly explain material keep/trim/docs-only decisions in the PR or maintenance
record. Passing cases proves behavior, not every paragraph's necessity. After
trimming decision guidance, rerun affected cases without weakening criteria;
wording-only edits need static checks. Do not impose a reduction quota.

## Version-sensitive capabilities

| Layer | Meaning |
|---|---|
| Repository tag | Catalog release containing the skill. |
| `metadata.meteor` | Minimum range for the complete decision flow. |
| Inline `Meteor X.Y+` | First release for a conditional capability. |
| Package floor | First independent package version for its API. |

When a capability starts after the skill's `metadata.meteor` minimum:

1. Label the first decision or example that can select it. Do not put the floor
   only in an evaluation.
2. State the earlier behavior, unavailability, or fallback.
3. Keep a broad range only when that branch stays accurate. Raise the range only
   when the complete outcome requires the newer release.
4. For package APIs, inspect `.meteor/versions`, `package.json`, or the lockfile.
   Do not infer them from the Meteor release.
5. Evaluate both sides of the boundary when the compatibility decision changes
   guidance.

## Evaluation cases

Each published skill keeps its acceptance prompts in `references/eval-cases.md`. Add only a realistic prompt with observable pass and fail conditions that catches a meaningful failure. State versions when relevant and add a near miss only for a plausible neighboring skill. Skip wording-only and duplicate cases.

Run affected prompts in fresh conversations or disposable projects. Hide the
criteria until each run finishes and record outcomes in the PR or review.
Use [verification evidence](references/verification-evidence.md) to distinguish
guidance, installed discovery and runtime checks. Workflow changes use the
maintainer's [acceptance cases](references/eval-cases.md).

## Preserve catalog patterns

Apply the catalog classification contract in `AGENTS.md` before changing frontmatter or routing. Read [`references/catalog-classification.md`](references/catalog-classification.md) before creating a skill or changing an existing classification.

## Apply an audit report

Use this workflow when [`skill-gap-audit`](../skill-gap-audit/SKILL.md) produced the input:

1. Verify the report's findings against its pinned evidence and the current skills/source.
2. Implement only authorized findings, excluding `Covered`, `Documentation only` and uncertain items. Proposed skills need explicit approval; prefer the existing owner.
3. Read complete target and neighboring skills. Preserve their useful structure and terminology.
4. Change only affected routing, decisions, references, cases and metadata. Link findings to guidance and acceptance evidence.
5. Run validation, including exclusion of maintainer skills from release archives.

An audit finding is evidence for review, not permission to broaden the task. If implementation reveals a materially different scope, stop and ask the user.

Do not rewrite a committed audit report after applying its findings. Preserve it as the baseline evidence, then record implementation in the change or produce a new audit report for the later agent-skills and Meteor revisions.

## New skill threshold

Create a published skill only when all conditions hold:

- It represents a repeatable Meteor application-development outcome.
- It changes agent decisions beyond facts already easy to retrieve.
- Its routing can be distinguished from neighboring skills.
- Its result can be evaluated with realistic prompts or executable evidence.
- It does not fit cleanly as a reference or case in an existing skill.

Otherwise, update an existing skill, add an evaluation case, or leave the information in Meteor documentation.

## Validation

Run static checks for every change. Changed decisions or routing also need
affected manual cases; wording-only edits do not. Keep temporary projects and
raw output outside the repository; record outcomes in the PR or review.

Run from the agent-skills repository root:

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
pnpm run build:plugin
```

Inspect the changed skill and complete plugin ZIPs; exclude maintenance
evidence from both. Report capabilities, evidence, checks and limitations.
Use `release-publishing` for release-wide installation/update checks.
