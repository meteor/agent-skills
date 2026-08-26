# Authoring an Agent Skill for `meteor/agent-skills`

This document is the contract for everyone writing a skill in this repo. Plan 01 created it; subsequent plans must not break it without updating it here first.

## Maintainer skills

Repository maintenance workflows live under `.github/skills/`. They help contributors maintain the published catalog but are not included in release ZIPs or the README catalog.

| Skill | Use when |
|-------|----------|
| [`skill-maintenance`](.github/skills/skill-maintenance/SKILL.md) | Creating, reviewing, or updating a published skill while preserving repository conventions. |
| [`skill-gap-audit`](.github/skills/skill-gap-audit/SKILL.md) | Comparing Meteor documentation and source changes with current skill coverage. |
| [`release-publishing`](.github/skills/release-publishing/SKILL.md) | Preparing, testing, tagging, or publishing beta and stable plugin releases. |

### Audit and maintenance workflow

`skill-gap-audit` is read-only by default. It produces an evidence-backed report and does not change published skills. Confirmed findings move to `skill-maintenance` only when the user requests implementation.

```text
skill-gap-audit
-> confirmed findings
-> authorized implementation scope
-> skill-maintenance
-> affected manual cases when routing or high-risk guidance changes
-> repository validation
-> release ZIP verification
```

When one request explicitly asks to audit and fix, complete the audit first, preserve its evidence, then load `skill-maintenance` and implement only confirmed findings within the requested scope. Do not implement uncertain findings or create proposed skills without explicit user approval.

`pnpm run validate` enforces frontmatter, naming, body size, prohibited-content rules, required evaluation-case files, and required revision and handoff fields in committed gap-audit reports. `pnpm run check-links` checks links in published and maintainer skills. The ZIP test suite verifies that `.github/skills/` and repository maintenance evidence remain outside release artifacts.

Committed gap-audit records live under `audits/skill-gaps/`. Each record identifies the audited agent-skills revision, Meteor remote and revision, release context, audit mode, and previous audit baseline. These reports are immutable maintenance evidence and are never included in distributable skills. An incremental audit uses the latest applicable committed record from Git history; if no reliable record exists, run a full audit.

Each published skill keeps its complete manual acceptance cases in `references/eval-cases.md`. These cases are the single source of truth for behavior checks. Run affected prompts in fresh conversations or disposable projects and record pass or fail outcomes in the PR or review. Do not commit temporary projects, transcripts, or raw model output. CI validates that the case file exists but does not invoke a model.

For a human-oriented explanation of how source review, deterministic checks,
manual behavior checks, and ZIP inspection fit together, read
the [maintenance verification guide](docs/maintenance-verification.md).

## What is a skill

A skill is a folder under `skills/` that helps an AI coding assistant work on Meteor 3 applications. A skill has:

```
skills/<name>/
├── SKILL.md             # required
├── references/          # optional: longer reference Markdown
├── scripts/             # optional: helper bash or .mjs scripts
└── assets/              # optional: templates, fixtures, images
```

`<name>` is lowercase-kebab-case, `[a-z0-9-]{1,64}`, equal to the `name` field in the frontmatter.

## Frontmatter

`SKILL.md` is YAML frontmatter followed by a Markdown body. The frontmatter is validated against `skill.schema.json`.

Required:

```yaml
---
name: meteor-async-migration
description: >
  Use when migrating Meteor 2.x code to Meteor 3.x async APIs. Triggers on
  callAsync, findOneAsync, removed Fibers, "X is not a function" errors after
  upgrade. Ask about top-level await and async cursors.
metadata:
  author: meteor
  kind: knowledge
  meteor: ">=3.0"
  area: migration
  tagline: "Migrate Meteor 2.x code to Meteor 3.x async APIs (callAsync, findOneAsync, Fibers removal)."
---
```

`description` is agent-facing and packed with trigger phrases so the assistant picks the skill against a user prompt. State the outcome, concrete positive triggers, and a boundary or handoff when neighboring skills overlap. Test routing changes with positive and near-miss prompts in the affected skills' `references/eval-cases.md`. `tagline` is human-facing: a short one-liner (16-200 chars) rendered as the bullet text in the README catalog. Keep them separate; do not collapse one into the other.

Optional:

```yaml
metadata:
  bundle: ["migration", "essentials"]
  docs_synced_at: "2026-05-14"
license: MIT
```

### Rules the validator enforces

- `name` must equal the folder name.
- `description` is <=1024 characters and contains at least two trigger phrases. Trigger phrases include: `Use when`, `Use this skill when`, `Use this Skill when`, `Triggers on`, any `ask about` or `asks about` substring.
- `metadata.tagline` is 16-200 characters. Rendered verbatim into the README catalog.
- `metadata.kind` is one of `knowledge`, `tool`, `workflow`.
- `metadata.area` is one of `auth`, `build`, `data`, `migration`, `ops`, `security`, or `testing`. `meta` is reserved for the non-publishable template.
- `metadata.meteor` is a semver range. Default for v1: `">=3.0"`.
- `metadata.author` is always the literal string `meteor`. Non-Meteor-org skills do not belong in this repo.
- Body (everything after the closing `---`) is <=8 KB. Larger content moves into `references/`.
- Published skill folders contain only `SKILL.md`, `references/`, `scripts/`, and `assets/`. Audit reports, raw results, reviewer guides, and maintainer files stay outside the distributable folder.

## Catalog classification

Treat a published skill's name, `metadata.kind`, `metadata.area`, bundle membership, Meteor range, and routing scope as stable classification. Preserve them during maintenance unless verified behavior no longer fits the classification and the user authorized that scope change. A classification change requires reviewing neighboring skill descriptions and evaluation cases, updating both `metadata.bundle` and `bundles.json` when bundle membership changes, and regenerating the catalog.

Choose classifications for a new skill from the closest existing skills and these definitions:

| Field | Meaning |
|-------|---------|
| `kind: knowledge` | Meteor-specific decisions, patterns, and examples are the primary value. |
| `kind: tool` | A bundled deterministic script or tool is essential to the outcome. |
| `kind: workflow` | An ordered multi-step operation or lifecycle is the primary value. |
| `area` | The closest existing framework domain listed in the schema. Add an area only when no current domain fits, then update this contract and the schema in the same change. |
| `bundle` | An installation audience that needs the complete skill, not merely a shared keyword or topic. |

Do not recategorize or restructure existing skills only to make them visually uniform. Preserve their useful local patterns unless they conflict with this contract or prevent the requested behavioral change.

## Trigger phrases

Trigger phrases are how agents pick the right skill. The `description` field is the only place an agent sees before deciding to load the body. Pack it with concrete trigger phrases. Bad: "Helps with Meteor". Good: "Use when the user calls Meteor.publish or asks about publication strategies".

## Body shape

Recommended sections (use what fits the skill):

- One-paragraph framing.
- Decision flow (numbered, terse).
- Rewrites or scaffolds (tables, code blocks).
- Common errors and fixes.
- Anti-patterns.

Bodies are read by agents, not humans. Prefer tables, terse imperatives, and copy-pasteable code blocks.

## Writing rules

These rules apply to every `SKILL.md` body and every `references/*.md` file. The validator does not enforce them; reviewers do.

- Tables beat prose; snippets beat explanations.
- No emoji unless it carries meaning (decorative emoji is banned).
- Bold (`**word**`) only on absolute imperatives: NEVER, ALWAYS, MUST. Do not bold nouns, do not bold for emphasis. Exception: the README catalog convention `- **\`<skill-name>\`**: <description>` is allowed because the bold is list-emphasis on the skill identifier, not prose emphasis.
- No italics for emphasis. Pick a stronger word instead.
- Headers (`##`, `###`) only for genuine structural separation. Do not use a header as a prose break.
- Code blocks only for actual code or commands. Schema notation goes in a ```` ```text ```` block.
- Tables only when the structure carries information. A two-column "label / value" used once is just a sentence.
- Strip filler. "In order to" becomes "to"; "make sure to" becomes the imperative itself.
- Concrete over abstract: paths, function signatures, exact flag names. Not "the right command".
- Project-global rules also apply: no em-dashes, no AI-attribution trailers.

## References

Long reference material goes in `references/`. Reference files that excerpt or restate v3-docs content end with a `Source:` footer:

```markdown
---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/<path>
```

The link checker verifies that the path resolves on the `devel` branch.

Reference files that are pure skill-internal content (notably `eval-cases.md`) do not need a `Source:` footer; the link checker only validates footers that exist, so omission is harmless.

## Scripts

Helper scripts go in `scripts/`. Conventions:

- Bash scripts: `#!/bin/bash`, `set -euo pipefail`, stderr for human output, stdout for JSON.
- `.mjs` scripts: ESM, Node 22+, no transpile.
- Document every script in the skill body.

## Naming conventions

- `meteor-<area>` for framework skills: `meteor-methods`, `meteor-pubsub`.
- `accounts-<thing>` for accounts subdomains: `accounts-oauth-setup`.
- `migrate-to-<x>` for migrations: `migrate-to-meteor-3`.
- `package-<thing>` for package authoring: `package-publish-flow`.

## Versioning

- Repo tags (`v0.1.0`, `v0.2.0`) version the catalog as a whole. Individual
  skills do not carry content versions. A partial install is identified by the
  selected skill path and repository tag or commit.
- `metadata.meteor` is the minimum Meteor range for the skill's complete
  decision flow. A capability introduced after that minimum must state its
  `Meteor X.Y+` floor at the first decision or example that can select it.
- Keep a broad Meteor range when the skill supplies an accurate lower-version
  branch. State whether the capability is unavailable, uses earlier behavior,
  or has a concrete fallback. Do not silently give post-minimum guidance to an
  earlier release.
- Independently released Atmosphere and npm packages use their package version,
  not the Meteor release, as the capability floor. Inspect `.meteor/versions`,
  `package.json`, and the lockfile before selecting package-specific APIs.
- Verify current behavior against `v3-docs/`. Verify introduction versions
  against versioned documentation, official release notes, tags, or Git
  history. Do not infer an introduction version only because a capability is
  present on `devel`.
- Add case coverage for both the supported version and an earlier-version
  near miss when a skill spans the capability boundary.
- A skill marked `metadata.meteor: ">=3.0"` must keep working on every Meteor 3.x release. If a behavior changes in 4.0, fork a new skill (`meteor-async-migration-4`) and bump `metadata.meteor`.

## Running the validator locally

```bash
pnpm install
pnpm run validate             # skills, audits, and required evaluation-case files
pnpm run check-links
pnpm test
```

All three must pass before opening a PR.

## Zip artifacts

`.zip` files under `skills/` are built artifacts and must not be committed.
The release workflow builds them on tag and uploads them as GitHub Release
assets. Locally, `pnpm run build:zips` produces them under `skills/` for
inspection; they are gitignored.

## Regenerating the catalog

After adding or editing a skill, regenerate the README catalog and the
bundles install snippets:

```bash
pnpm run catalog:write
```

Commit the README diff in the same PR. CI runs `pnpm run catalog:check`
and fails the PR if `README.md` is out of sync. Bundle membership lives
in `bundles.json`; keep it in step with each skill's `metadata.bundle`
array.

The `<!-- SKILLS:BEGIN -->...<!-- SKILLS:END -->` and
`<!-- BUNDLES:BEGIN -->...<!-- BUNDLES:END -->` blocks belong to the
generator. Hand edits inside the markers are reverted on next run.

## How a skill is reviewed

1. Validator must pass.
2. Link checker must pass.
3. The skill body is <=8 KB; bigger content moves to `references/`.
4. For a new skill, routing change, or high-risk guidance change, at least one outside contributor runs the affected cases in `references/eval-cases.md` against Claude Code or Cursor.
5. New skills, routing changes, and high-risk decision changes add or update the smallest relevant cases in `references/eval-cases.md`. Run affected prompts in fresh conversations or disposable projects and record their outcomes in the PR.
6. The PR description links to the relevant v3-docs section(s).
