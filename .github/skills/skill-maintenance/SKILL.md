---
name: skill-maintenance
description: Use when creating, reviewing, or updating a published skill in meteor/agent-skills, including applying confirmed skill-gap audit findings. Preserves repository conventions, distributable format, factual evidence, routing boundaries, references, metadata, and behavioral evaluation coverage.
---

# Maintain Meteor agent skills

Create focused, verifiable skills for Meteor application developers. Preserve the repository contract and avoid turning the catalog into a copy of the documentation.

## Scope

Published skills live under `skills/`. Maintainer workflows live under `.github/skills/` and are not release artifacts.

Before editing:

1. Read `AGENTS.md` completely.
2. Read `skills/_template/SKILL.md` for a new skill.
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

## Authoring workflow

1. Define one coherent user outcome and the neighboring requests it excludes.
2. Map every capability advertised in the description to instructions and an evaluation case.
3. Keep routing and essential decisions in `SKILL.md`. Move conditional detail and long examples into focused references.
4. Use scripts only for repeated operations where deterministic execution improves reliability.
5. Preserve naming, frontmatter, writing, versioning, source footer, and bundle rules from `AGENTS.md`.
6. Keep only runtime skill content under `skills/<name>/`: `SKILL.md`, `references/`, `scripts/`, and `assets/`. Keep audit reports, raw results, and reviewer-only solutions outside the distributable folder.
7. Bump `metadata.version` for meaningful behavioral guidance changes. Update `docs_synced_at` only after checking the relevant current documentation.
8. Regenerate the catalog when names, taglines, or bundle membership change.
9. Add realistic positive, failure, and near-miss evaluation cases. Grade observable behavior instead of exact wording.
10. Run all repository checks before reporting completion.

## Preserve catalog patterns

Apply the catalog classification contract in `AGENTS.md` before changing frontmatter or routing.

- For an existing skill, preserve its name, `metadata.kind`, `metadata.area`, bundle membership, Meteor range, routing scope, and useful local structure by default.
- Change a classification only when verified behavior no longer fits it and the user authorized the scope change. Review neighboring descriptions and evaluation cases because recategorization can change skill selection and installation expectations.
- For a new skill, use the closest neighboring skills to choose the naming family, kind, area, bundle membership, body shape, reference placement, and evaluation style.
- Reuse an existing area when it fits. Add a new area only when no current domain fits, then update `AGENTS.md` and `skill.schema.json` in the same change.
- Base bundle membership on the installation audience that needs the complete skill. Keep `metadata.bundle` and `bundles.json` synchronized.
- Do not normalize an existing skill merely for visual consistency. Preserve local patterns unless they conflict with the repository contract or block the requested behavioral change.

## Apply an audit report

Use this workflow when [`skill-gap-audit`](../skill-gap-audit/SKILL.md) produced the input:

1. Read the report, its Meteor revision, and the cited documentation, source, or tests.
2. Confirm each finding still applies to the current skill and Meteor checkout.
3. Implement only the findings authorized by the user. Do not act on `Covered`, `Documentation only`, or uncertain findings.
4. Require explicit approval before adding a proposed skill. Prefer an existing skill when it already owns the user outcome.
5. Read the complete target skill and neighboring skills before editing. Match their structure, terminology, tables, snippets, and reference placement so the change feels native instead of appended.
6. Update the smallest coherent surface: routing description, decision guidance, supporting reference, evaluation case, and metadata only where each is affected.
7. Preserve an evidence trail from the report finding to the changed guidance and its acceptance case.
8. Run validation and confirm the internal maintainer skills remain outside release archives.

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

Run from the agent-skills repository root:

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
```

Confirm that internal `.github/skills/` files are absent from generated ZIPs. Inspect the changed skill's archive for unexpected content. Report changed capabilities, evidence used, checks run, and remaining limitations.
