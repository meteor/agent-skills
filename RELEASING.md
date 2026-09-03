# Releasing

Use the maintainer [`release-publishing`](./.github/skills/release-publishing/SKILL.md)
skill when asking an agent to prepare or publish a beta or stable release.

Use the [final contribution recipe](./docs/maintenance-verification.md#final-contribution-review)
for an explanation of what each verification proves and what still requires
human review.

## Prepare

- Keep the version in `.codex-plugin/plugin.json` and
  `.claude-plugin/plugin.json` identical.
- Bump both versions deterministically with `pnpm release:bump X.Y.Z`.
- Use `1.0.0-beta.1` for the first public installation test, then increment the
  prerelease number only when publishing another beta.
- Choose the matching `vX.Y.Z` repository tag for the complete catalog
  snapshot, for example `v1.0.0-beta.1`.
- Regenerate the catalog with `pnpm run catalog:write`.
- Complete the source and behavioral reviews described in `AGENTS.md`.
- Confirm each changed skill's evaluation cases reflect its current behavior.
- Record affected manual cases and their results in the release PR.
- Record supported clients and known limitations in the release notes.

The catalog can release independently for skill and packaging changes. Those releases
follow the normal preparation, verification, and publishing steps without waiting for
a Meteor release or recording a Meteor compatibility mapping. The coordinated process
below applies only when a catalog release is intentionally paired with Meteor.

### Coordinated Meteor releases

When this catalog is paired with a Meteor release, record the exact mapping in the
release PR and handoff:

```text
Meteor version: <version>
Meteor release commit: <commit SHA>
Agent Skills audit: <committed audit path and revision>
Agent Skills audit base: <default-branch ref and commit SHA>
Agent Skills version: <X.Y.Z-beta.N or X.Y.Z>
Agent Skills publish commit: <tag target commit SHA>
Agent Skills tag: <vX.Y.Z-beta.N or vX.Y.Z>
```

Use a public Agent Skills beta for both Meteor beta and RC releases. Use a stable Agent
Skills version for an official Meteor release only after its tagged beta passed local
checks, exact-tag remote installations, and affected manual cases. The two projects
have independent version sequences; never mirror the Meteor version automatically.

The first release audit may include approved but uncommitted Meteor documentation.
Before tagging, require an audit against the final Meteor release commit. Preserve a
committed earlier report and add an incremental follow-up when needed.

Resolve the initial audit from a clean worktree pinned to the freshly fetched Agent
Skills default-branch SHA. Before version preparation, compare that audited SHA with
the merged release candidate. If the default branch or distributable catalog changed,
record the drift and rerun the affected audit and verification instead of silently
publishing a different snapshot.

Publish the catalog only after the paired Meteor packages, tool builds, and bootstrap
tarballs are live. After the GitHub release and exact-tag installation tests pass,
request the dedicated Meteor Agent Skills changelog section only for this newly
published paired tag. Omit the section entirely when no Agent Skills version was bumped
or when the catalog release was independent; do not use an `N/A` placeholder.

Keep the Meteor changelog entry concise and client-neutral. Record the exact tested
`vX.Y.Z-beta.N` release link for a Meteor beta or RC, or the verified stable tag for an
official release, then promote the generic `npx skills add meteor/agent-skills`
installer and link the official
[Meteor Agent Skills guide](https://docs.meteor.com/ai/agent-skills). The generic
command does not pin the linked tag; keep tested exact-tag Codex and Claude Code
commands in the Agent Skills release notes.

## Verify

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
claude plugin validate . --strict
```

- Confirm `skills/` contains one ZIP for each published skill.
- Validate the Codex manifest with the current plugin-creator validator.
- Install one representative skill with `npx skills add` in a clean project.
- Install one ZIP manually and confirm its references load.
- Test the complete plugin from the local repository in Codex and Claude Code.
- Confirm CI is green on `main`.
- For a coordinated Meteor beta or RC, run every affected manual case and at least one
  realistic updated-skill workflow against the exact Meteor candidate.
- For a coordinated official release, repeat the exact-tag installation smoke tests
  with the stable catalog and confirm it preserves the accepted beta behavior.

## Test the plugin locally

Test Claude Code directly from the working tree while iterating:

```bash
claude --plugin-dir .
```

Test the exact marketplace installation flow before publishing:

```bash
codex plugin marketplace add .
codex plugin add meteor@meteor

claude plugin marketplace add . --scope local
claude plugin install meteor@meteor --scope local
```

Start a new conversation after installing or reinstalling so the agent loads
the current plugin contents. Remove and reinstall the local Codex plugin when
testing changes under the same version:

```bash
codex plugin remove meteor@meteor
codex plugin add meteor@meteor
```

## Ask for release verification

Before tagging, you can ask a maintainer agent:

> Review this branch for release readiness. Confirm the planned repository tag,
> catalog and bundle state, source and behavior checks, complete local checks,
> and changed ZIP contents. List blockers and known
> limitations. Do not create a tag, release, commit, or push unless explicitly
> requested.

## Publish

The tag workflow rejects a release when the tag does not match both plugin
manifests.

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

- Confirm the GitHub release contains every ZIP artifact.
- Install one skill from the tagged release.
- Install the complete Codex and Claude Code plugin from the same tag.
- Check that the release notes state the tested scope and known limitations.
