# Skill gap audit method

## Source pattern

This method adapts the Meteor source repository's `.github/skills/docs-gap/SKILL.md` pattern: gather and filter changes, assess existing coverage, classify and prioritize gaps, and produce a report for later action. It also uses `.github/skills/changelog/SKILL.md` to locate canonical release information and understand the checkout's branching conventions.

Reuse the source skills' evidence-gathering conventions without inheriting fixed paths, `devel`, or release-branch assumptions. The resolved checkout and requested comparison define the audit.

## Resolve the previous audit baseline

Use this order:

1. Prefer an audit report or baseline revision supplied by the user.
2. Otherwise, inspect committed Markdown reports under `audits/skill-gaps/` using Git history, not file modification time.
3. Select the latest report applicable to the same Meteor major version and audited skill scope. Read its agent-skills revision, Meteor remote and revision, release context, and audit mode.
4. Confirm that the referenced commits exist and that the report is committed on the current agent-skills branch history.
5. If the record is missing, ambiguous, incompatible, or incomplete, run a full audit instead of inventing a baseline.

Never overwrite a committed audit report. A later report points to its predecessor and records the new comparison revisions. Do not convert `docs_synced_at` into an exact Git baseline; use it only as a search hint when no recorded commit SHA exists.

## Choose the audit mode

### Full audit

Use a full audit for the first review or when no reliable baseline exists. Inventory all published skills, inspect the current `v3-docs/` tree, verify every factual and behavioral claim in each distributable skill, and inspect implementation and tests for ambiguous or high-risk claims.

### Release audit

Use a release audit when the task targets the current or latest Meteor release:

1. Prefer an explicitly requested version. Otherwise derive the release context from the checked-out branch and canonical Meteor changelog entries.
2. When present, read `.github/skills/changelog/SKILL.md` to locate the canonical changelog and understand the checkout's release conventions.
3. Review features, improvements, fixes, breaking changes, migration steps, bumped packages, linked pull requests, and official release notes.
4. Use the changelog as a discovery index, not as complete proof. Verify its entries against the Git diff, current documentation, implementation, and tests.
5. Include relevant user-facing changes omitted from the changelog.

### Incremental audit

Use an incremental audit when a reviewed Meteor revision is known. Compare the supplied or recorded base with the target revision, defaulting the target to the current checked-out `HEAD`. Ask when the correct base is ambiguous.

Focus on user-visible changes under `v3-docs/`, `packages/`, `tools/`, `npm-packages/`, and relevant release scripts. Record both revisions in the report. Do not assume `devel`, a release branch, or a tag as the comparison base.

## Audit distributable content deeply

Audit the exact runtime content that can enter each published ZIP: `SKILL.md`, every reference, every helper script, and any assets whose behavior or output is described by the skill. Treat reviewer-only material outside `skills/<name>/` as evaluation evidence, not distributable guidance.

For every advertised or instructional claim, record:

- The skill file and section containing the claim.
- Its context, including server or client, development or production, supported Meteor versions, framework integration, and shared or environment-specific code.
- The matching documentation section, changelog or release item, implementation symbol, and test when applicable.
- Whether the claim is verified, partial, outdated, overlapping, unsupported by available evidence, or documentation only.
- The evaluation case that proves the agent applies the claim correctly.

Do not mark a skill covered because its topic appears in documentation. Compare the actual decision rules, commands, examples, exclusions, failure handling, and version conditions written in the distributable skill.

## Inspect Meteor evidence

Use `v3-docs/` as the primary description of public behavior. Locate relevant documents by API name, package, command, configuration key, error text, and user workflow. Do not assume a fixed directory below `v3-docs/`.

Inspect implementation and tests when documentation is missing or contradictory, a skill makes a version, default, security, migration, or compatibility claim, a changed API may affect several skills, or an example depends on behavior not stated precisely in documentation.

Meteor checkout skills under `.github/skills/` can guide source navigation, testing, conventions, release analysis, and documentation analysis. Treat them as contributor context, not as proof of public application behavior.

Keyword absence is not proof of a gap. Confirm the user outcome and inspect related terminology before classifying it.

Include documentation changes that alter public guidance, new or changed APIs, commands, configuration, migration requirements, security behavior, and user-actionable performance features. Exclude CI-only changes, test-harness maintenance, release mechanics, and internal refactors unless they change public behavior.
