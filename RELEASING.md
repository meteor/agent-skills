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
- Use `0.1.0-beta.1` for the first public installation test, then increment the
  prerelease number only when publishing another beta.
- Choose the matching `vX.Y.Z` repository tag for the complete catalog
  snapshot, for example `v0.1.0-beta.1`.
- Regenerate the catalog with `pnpm run catalog:write`.
- Complete the source and behavioral reviews described in `AGENTS.md`.
- Confirm each changed skill's evaluation cases reflect its current behavior.
- Record affected manual cases and their results in the release PR.
- Record supported clients and known limitations in the release notes.

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
