---
name: skill-gap-audit
description: Use when auditing meteor/agent-skills for missing, incomplete, overlapping, or outdated coverage. Compares every distributable skill with a configurable Meteor checkout, changelog and release context, v3-docs, source, tests, and the latest committed audit baseline, then produces an evidence-backed report without editing skills.
metadata:
  internal: true
---

# Audit Meteor skill gaps

Compare the published catalog with current Meteor documentation and implementation. Produce a prioritized maintenance report. Do not create or edit skills during the audit.

This workflow adapts Meteor's `docs-gap` and `changelog` skill patterns while keeping the checkout path, checked-out branch, release context, and comparison revisions configurable.

## Inputs

Determine these inputs before analysis:

- Agent-skills repository root.
- Agent-skills target ref and commit SHA. A coordinated release supplies the freshly
  fetched default-branch ref and a clean worktree pinned to that SHA.
- Meteor source checkout.
- Audit mode: full catalog or incremental changes.
- Meteor base and target Git revisions for an incremental audit.
- Meteor version or release context when the audit targets a release.
- Reviewed Meteor changelog, docs-gap report, and approved documentation changes
  when a coordinated release supplies them.
- Optional previous committed audit record.
- Optional output path. Return the report in the response when no path is requested.

## Coordinated Meteor release audits

When the Meteor release process invokes this skill, start after its changelog and
approved documentation gaps have been consolidated. Treat those artifacts as discovery
and user-facing intent, then verify their claims against the release diff, current
documentation, implementation, and tests. Do not copy core maintainer workflows into
the public application-developer catalog.

The Meteor release commit may not exist yet during the first audit. In that case,
include approved working-tree documentation changes, record the Meteor commit SHA and
dirty state, and identify the audit as pre-publication. Before the Agent Skills tag is
published, audit the exact Meteor release commit from a clean Agent Skills worktree
pinned to the catalog commit being prepared for publication. If the first report is
already committed, preserve it and create an incremental follow-up instead of
rewriting it.

## Pin the Agent Skills snapshot

For a coordinated release, require the caller to supply an Agent Skills target ref and
commit SHA resolved after fetching the repository's default branch. Verify that the
audit worktree is clean and that its `HEAD` equals the supplied SHA. Load this skill and
inspect distributable content from that same worktree; do not load audit instructions
from one revision while analyzing another.

Record the target ref, exact commit SHA, and clean state in the report. If the checkout
is dirty, stale, or at a different commit, stop and ask the caller to provide a clean
pinned worktree. This audit does not fetch, switch branches, or create worktrees on its
own.

For a standalone audit without a supplied target, use the current `HEAD`, record its
branch, SHA, and dirty state, and state that remote freshness was not established. Do
not claim that it represents the latest published or default-branch catalog without
evidence.

## Resolve the Meteor checkout

1. Prefer a path supplied by the user or task.
2. Otherwise, use `METEOR_CHECKOUT` when it is set.
3. Otherwise, inspect accessible workspace roots and direct sibling directories for candidates.
4. Validate each candidate with `git -C <path> rev-parse --show-toplevel` and require `v3-docs/`, `packages/`, and `tools/`. Use Git remotes to distinguish `meteor/meteor` or a clear fork from unrelated repositories.
5. Continue automatically only when one credible candidate remains. Report its resolved path, remote, branch, commit SHA, and dirty state.
6. Ask the user for a checkout path when discovery finds none or remains ambiguous. Do not assume a home directory layout or clone without authorization.

The checkout can live anywhere accessible in the current environment. Do not store its machine-specific absolute path in committed skill content.

## Audit method

Read [`references/audit-method.md`](references/audit-method.md) before gathering evidence. It defines committed baselines, full, release, and incremental modes, changelog and release review, deep distributable-claim comparison, and source filtering.

## Build the skill inventory

For every publishable folder under `skills/`:

1. Read the frontmatter description, tagline, kind, area, bundle membership, Meteor range, and documentation sync date.
2. List the outcomes and symptoms promised by `SKILL.md`.
3. Map each promise to its supporting reference and evaluation case.
4. Compare naming, classification, routing, structure, references, and case style with the closest neighboring skills. Treat useful local variation as intentional unless it conflicts with the repository contract or behavior.
5. Note overlap with neighboring skills, promises without behavioral coverage, and classifications that do not match the skill's actual outcome or installation audience.
6. Exclude folders beginning with `_` and internal `.github/skills/`.

## Classify findings

| Classification | Meaning | Normal action |
|----------------|---------|---------------|
| Covered | Current skill instructions and cases address the behavior | No change |
| Partial | Skill mentions it but lacks a decision rule, example, or evaluation | Expand existing skill |
| Outdated | Skill conflicts with current documentation or implementation | Correct and retest |
| Overlap | Multiple skills advertise the same request without clear routing | Narrow descriptions |
| Candidate | Important repeatable workflow has no suitable skill | Propose a skill |
| Documentation only | Useful fact does not justify agent workflow guidance | Leave in docs |
| Uncertain | Available evidence is missing or contradictory | Investigate and do not implement |

Propose a new skill only when it meets the threshold in [`skill-maintenance`](../skill-maintenance/SKILL.md). Prefer expanding an existing skill when its scope already owns the user outcome.

## Prioritize

Use this order:

1. Incorrect security, data-access, deployment, or migration guidance.
2. Removed APIs and breaking behavior.
3. Advertised capabilities with no instructions or acceptance case.
4. New user-facing workflows with strong skill value.
5. Routing overlap and near-miss failures.
6. Helpful improvements that are not release blockers.

## Report

Read [`references/report-template.md`](references/report-template.md) before producing the report.

Every finding must include:

- Classification and priority.
- Affected skill or proposed scope.
- User impact.
- Evidence path, revision, and relevant symbol or section.
- Existing acceptance cases.
- Recommended action and acceptance evidence.

For full and release audits, include a claim matrix covering every distributable skill. For incremental audits, include every changed claim plus all claims affected by the Meteor diff, even when the skill file itself did not change.

Keep uncertain findings separate from confirmed gaps. State why evidence is insufficient and what would resolve it.

## Handoff to skill maintenance

The audit is read-only except for writing a report to a user-requested output path. Do not update skills, metadata, branches, or GitHub state during an audit-only request.

When the user asks only for an audit, stop after the report and offer the prioritized findings for review.

When the same request explicitly asks to audit and fix:

1. Finish and preserve the audit report before editing.
2. Read [`skill-maintenance`](../skill-maintenance/SKILL.md).
3. Implement only confirmed `Partial`, `Outdated`, or `Overlap` findings within the authorized scope.
4. Ask before creating a `Candidate` skill or acting on an uncertain finding.
5. Keep each change traceable to its evidence and acceptance criteria.
6. Run the complete maintenance validation and report which findings were applied.
