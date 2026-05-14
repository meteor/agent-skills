# Authoring an Agent Skill for `meteor/agent-skills`

This document is the contract for everyone writing a skill in this repo. Plan 01 created it; subsequent plans must not break it without updating it here first.

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
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: migration
  tagline: "Migrate Meteor 2.x code to Meteor 3.x async APIs (callAsync, findOneAsync, Fibers removal)."
---
```

`description` is agent-facing and packed with trigger phrases so the assistant picks the skill against a user prompt. `tagline` is human-facing: a short one-liner (16-200 chars) rendered as the bullet text in the README catalog. Keep them separate; do not collapse one into the other.

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
- `metadata.meteor` is a semver range. Default for v1: `">=3.0"`.
- `metadata.author` is always the literal string `meteor`. Non-Meteor-org skills do not belong in this repo.
- Body (everything after the closing `---`) is <=8 KB. Larger content moves into `references/`.

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

- Each skill has its own `metadata.version`. Bump it independently when content changes meaningfully.
- Repo tags (`v0.1.0`, `v0.2.0`) are aggregate snapshots of the catalog.
- A skill marked `metadata.meteor: ">=3.0"` must keep working on every Meteor 3.x release. If a behavior changes in 4.0, fork a new skill (`meteor-async-migration-4`) and bump `metadata.meteor`.

## Running the validator locally

```bash
pnpm install
pnpm run validate
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
4. At least one outside contributor (not the author) follows `references/eval-cases.md` against Claude Code or Cursor.
5. The PR description links to the relevant v3-docs section(s).
