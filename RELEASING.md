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

### Release branch and PR

Publish betas, including catalogs paired with a Meteor beta or RC, from the existing
release PR branch. Keep that PR open and its branch unmerged after publication.
Record the repository, branch, PR and exact head SHA; keep preparation and later
publication records in the same PR. Do not create follow-up branches just to publish
or update installation links. Do not merge, close or delete the Meteor release
branch/PR either. Publishing does not authorize those actions.

Stable publication retains the reviewed, merged default-branch candidate gate;
merging still requires a separate explicit user request. For beta/RC, if the PR is
already merged/closed or its branch is missing, ask for a target instead of
automatically recreating a branch or PR.

### Coordinated Meteor releases

When this catalog is paired with a Meteor release, record the exact mapping in the
release PR and handoff:

```text
Meteor version: <version>
Meteor release commit: <commit SHA>
Agent Skills audit: <committed audit path and revision>
Agent Skills audit base: <release-PR ref and head SHA for beta/RC; default-branch ref and SHA for stable>
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

Resolve the audit from a clean worktree pinned to the freshly fetched release PR head
for beta/RC, or default-branch SHA for stable. Do not substitute a synthetic PR merge
commit for the reviewed branch head. Before version preparation, compare that audited
SHA with the selected release candidate. If that branch or distributable catalog changed,
record the drift and rerun the affected audit and verification instead of silently
publishing a different snapshot.

Publish the catalog only after the paired Meteor packages, tool builds, and bootstrap
tarballs are live. After the GitHub release and exact-tag installation tests pass,
request the dedicated Meteor Agent Skills changelog section only for this newly
published paired tag. Omit the section entirely when no Agent Skills version was bumped
or when the catalog release was independent; do not use an `N/A` placeholder.

Keep the Meteor changelog entry concise and client-neutral. Record the exact tested
`vX.Y.Z-beta.N` release link for a Meteor beta or RC, or the verified stable tag for an
official release. Use the same tag in the generic npm command:
`npx skills@1.5.18 add 'meteor/agent-skills#vX.Y.Z-beta.N'` or
`npx skills@1.5.18 add 'meteor/agent-skills#vX.Y.Z'`. Test the displayed command
remotely and verify that the installed files match the tag. Link the official
[Meteor Agent Skills guide](https://docs.meteor.com/ai/agent-skills), and keep
client-specific commands in the Agent Skills release notes.

## Verify

```bash
pnpm install --frozen-lockfile
pnpm run validate
pnpm run check-links
pnpm run catalog:check
pnpm test
pnpm run build:zips
pnpm run build:plugin
claude plugin validate . --strict
claude plugin validate .claude-plugin/plugin.json --strict
```

- Confirm `skills/` contains one ZIP for each published skill.
- Inspect `dist/meteor-plugin.zip` for both plugin manifests, marketplace files,
  the icon, license and all published skill files. It must exclude `.github/`,
  audits, release notes, dependencies and nested per-skill ZIPs.
- Compare extracted files with the tagged sources, including executable script
  modes. `build:plugin` uses fixed timestamps and ordering for reproducible ZIPs.
- Directory submission is separate from repository distribution. Review the
  listing in `docs/releases/first-stable-release-notes.md` and the artwork
  provenance in `assets/README.md`. Obtain an approved original at the required
  directory dimensions before submitting; the repository icon is 298 x 298.
- Validate the Codex manifest with the current plugin-creator validator.
- Install one representative skill with `npx skills add` in a clean project.
- Install one ZIP manually and confirm its references load.
- Test the complete plugin from the local repository in Codex and Claude Code.
- Confirm CI is green for the exact release PR head for beta/RC, or the merged
  default-branch candidate for stable. Green `main` CI does not verify a beta branch.
- For a coordinated Meteor beta or RC, run every affected manual case and at least one
  realistic updated-skill workflow against the exact Meteor candidate.
- For a coordinated official release, repeat the exact-tag installation smoke tests
  with the stable catalog and confirm it preserves the accepted beta behavior.

## Test the plugin locally

### Published installation smoke checks

The `published-install` workflow runs on PRs, pushes to `main`, manual dispatch,
and after the release workflow creates a GitHub release. PR/manual runs default
to the most recently published catalog, including prereleases. Post-publication
runs use that release's exact tag. An explicit missing tag fails rather than
falling back to another version.

Run the same check locally:

```bash
pnpm run test:install
pnpm run test:install v1.1.0-beta.4
node scripts/smoke-install.mjs v1.1.0-beta.4 --installer latest
```

The script uses disposable projects and a fresh npm cache. It defaults to the
documented compatible installer, `skills@1.5.18`. CI runs it directly on
Meteor 3.0's Node 20.15.1, the reported Node 20.16.0 shell, Meteor 3.1's Node
22.11.0, and the Node 24/26 lines. A separate Node 22.20.0 job tracks
`skills@latest`. The compatible jobs must not substitute a newer runtime.
These are installation environments, not new requirements for Meteor apps.

Skills CLI 1.5.18's `--all` also includes internal maintainer skills and selects
all agents. The public full-catalog check uses `--agent codex --copy --yes`
without a skill selector. Keep generated README and bundle commands on the
tested installer pin, and verify any replacement before changing it.

Checks include selected installation, selected-file refresh with unselected
content preserved, and all published skills. Installed inventories, file bytes
and executable modes must match the actual tag; maintainer skills must remain
absent. Both plugin manifests must match the tag, and all expected ZIP assets
must be present. CI records the tag, commit, installer, Node and npm versions.

This job tests public Skills CLI distribution, not the PR's untagged skill
content. Plugin-client discovery, model behavior, platform-specific installs
and downloaded ZIP byte comparisons remain separate release checks. `@latest`
can change between runs; a green run verifies the recorded installer version.

### Working-tree plugin checks

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

- Confirm the GitHub release contains every skill ZIP and `meteor-plugin.zip`.
- Install one skill from the tagged release.
- Install the complete Codex and Claude Code plugin from the same tag.
- Check that the release notes state the tested scope and known limitations.
- Keep beta/RC PRs open and release branches unmerged. Record post-publication
  installation results on the same PR branch without moving the published tag.
