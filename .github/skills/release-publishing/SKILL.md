---
name: release-publishing
description: Use when preparing, testing, tagging, or publishing beta and stable releases of the Meteor agent-skills plugin for Codex and Claude Code.
metadata:
  internal: true
---

# Publish Meteor agent skills

Prepare one catalog version for Codex, Claude Code, GitHub release assets, and
direct skill installation. Read [`RELEASING.md`](../../../RELEASING.md) before
changing release state.

## Choose the release stage

| Stage | Repository visibility | Version and tag | Purpose |
|---|---|---|---|
| Working-tree test | Private or public | No new tag required | Validate local manifests and behavior. |
| Public beta | Public | `X.Y.Z-beta.N` and `vX.Y.Z-beta.N` | Test the exact remote installation path. |
| Stable | Public | `X.Y.Z` and `vX.Y.Z` | Publish the accepted catalog and submit it to directories. |

A GitHub repository does not need to be public for local working-tree tests.
It must be public before testing installation through
`meteor/agent-skills@<tag>` or submitting to public directories.

## Prepare the version

Inspect the worktree first and preserve unrelated changes. Set the same global
version in both plugin manifests with:

```bash
pnpm release:bump 0.1.0-beta.1
```

Use a stable version only after its beta has passed local and tagged remote
installation tests:

```bash
pnpm release:bump 0.1.0
```

Do not add versions to `package.json` or individual `SKILL.md` files. The
repository tag identifies the complete catalog snapshot.

## Verify

Run the checks in `RELEASING.md`. The tag workflow automatically rejects a tag
that does not match both manifests.

Test from the working tree before making the repository public. After pushing a
beta tag, repeat the Codex, Claude Code, and individual-skill installations
from that exact tag.

## Publish

Treat preparation and publication as separate operations.

- A request to prepare a release authorizes local version changes and checks.
- A request to publish a release authorizes the requested commit, tag, push,
  and GitHub release flow.
- Marketplace submissions require the publisher account, approved listing
  details, and explicit authorization for that submission.

When publication is authorized, commit the verified release preparation, tag
that commit with the matching `v` prefix, and push the tag. The GitHub workflow
validates the version again, builds skill ZIPs, and creates the GitHub release.
Beta tags are marked as prereleases. Confirm the release succeeds before
testing remote installation.

Do not reuse or move a published tag. Prepare a new beta number or patch
version when a tagged release needs a correction.
