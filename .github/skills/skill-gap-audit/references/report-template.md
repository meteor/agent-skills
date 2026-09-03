# Meteor skill gap audit

## Run context

```text
Agent-skills target ref: <default-branch ref, explicit ref, or current HEAD>
Agent-skills revision: <commit SHA and clean/dirty state>
Meteor checkout: <resolved path for this run>
Meteor remote: <remote URL>
Meteor branch: <branch>
Meteor revision: <commit SHA and dirty state>
Meteor release context: <version, release branch, or not applicable>
Audit mode: <full, release, or incremental>
Comparison: <base and target revisions, when applicable>
Previous audit report: <committed path and commit, or none>
Previous Meteor revision: <commit SHA, or none>
```

Omit the local checkout path from a report intended for commit. Keep the remote and commit SHA.

## Source coverage

Record the canonical changelog entry, official release notes, linked pull requests, documentation sections, Git diff paths, implementation areas, and tests reviewed. State `Not applicable` for sources that do not apply. Do not treat the changelog as exhaustive.

## Summary

| Classification | Count |
|----------------|-------|
| Covered | 0 |
| Partial | 0 |
| Outdated | 0 |
| Overlap | 0 |
| Candidate | 0 |
| Documentation only | 0 |
| Uncertain | 0 |

## Release blockers

List confirmed critical and high-priority findings. State `None` when there are no release blockers.

| Finding | Skill | User impact | Evidence | Required action |
|---------|-------|-------------|----------|-----------------|

## Maintenance findings

| Finding | Classification | Priority | Skill or scope | Evidence | Evaluation coverage | Recommended action |
|---------|----------------|----------|----------------|----------|---------------------|--------------------|

## Skill claim matrix

| Skill | Distributable file and section | Claim and context | Evidence | Status | Evaluation coverage |
|-------|--------------------------------|-------------------|----------|--------|---------------------|

A full or release audit includes every factual and behavioral claim from every distributable skill. An incremental audit includes changed claims and all existing claims affected by the Meteor comparison diff.

## Proposed skill candidates

For each candidate, record the coherent user outcome, neighboring exclusions, why existing skills cannot own it, and how its behavior could be evaluated. Omit this section when no candidate meets the new-skill threshold.

## Evaluation gaps

List advertised capabilities without cases, missing near-miss prompts, and cases whose expected behavior conflicts with current evidence.

## Uncertain findings

Record the missing evidence and the exact source, test, or maintainer decision needed to resolve each item. Do not count uncertain findings as confirmed gaps.

## No-action findings

Summarize relevant documentation changes classified as covered or documentation only. This prevents the same items from being repeatedly raised.

## Recommended next actions

Order actions by priority. Each action must name the affected skill, expected change, and acceptance evidence.

## Maintenance handoff

Record which confirmed findings the user authorized for implementation. Link each authorized finding to its target skill and acceptance evidence. Keep proposed skills and uncertain findings outside the implementation scope unless the user approves them explicitly.
