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

## Coordinate with a Meteor release

When Meteor's release process requests a paired catalog, record the Meteor version,
release commit, Agent Skills audit report, audited Agent Skills revision, publish
commit, and exact catalog tag. Catalog semver is independent from Meteor semver. Do
not derive one version from the other.

| Meteor stage | Agent Skills stage |
|---|---|
| Beta | Public beta, `X.Y.Z-beta.N` |
| RC | Public beta, `X.Y.Z-beta.N` |
| Official | Stable, `X.Y.Z` |

The documented catalog stages are public beta and stable, so a Meteor RC remains paired
with an Agent Skills beta unless the repository adopts a separate RC policy.

Before preparing the catalog version:

1. Require a completed release audit against the final Meteor release commit and a
   clean Agent Skills candidate revision resolved from the freshly fetched default
   branch. If an earlier audit used uncommitted documentation or a different Agent
   Skills revision, require a new incremental report and preserve the earlier committed
   record.
2. Confirm every authorized release-blocking finding is implemented and its affected
   manual cases pass.
3. Confirm the maintenance branch is merged and CI is green on the candidate commit.
4. Select the catalog version explicitly. A user may approve a new beta snapshot with
   no distributable skill change when the purpose is to record tested compatibility
   with a Meteor candidate.

Load this publishing skill from the same clean checkout and revision selected for the
release candidate. Record that commit as `AGENT_SKILLS_CANDIDATE_SHA`. If the remote
default branch advances before version preparation, report the drift and explicitly
choose whether to keep the reviewed candidate or update it. Updating requires a new
audit of every affected catalog claim and another validation pass.

Publish the Agent Skills tag only after the paired Meteor packages, tool builds, and
bootstrap tarballs are live. A stable catalog must be based on a tagged beta that
passed local checks, remote installation tests, and affected behavioral cases. If its
guidance changed afterward, publish and test another beta before stable promotion.

After publication, record the exact Meteor-to-catalog mapping and live GitHub release
URL in the release handoff. Add the companion link to Meteor's changelog only after the
tag exists and remote installation tests pass. For an official Meteor release, replace
the prerelease link with the stable tag.

## Prepare the version

Inspect the worktree first and preserve unrelated changes. Set the same global
version in both plugin manifests with:

```bash
pnpm release:bump 1.0.0-beta.1
```

Use a stable version only after its beta has passed local and tagged remote
installation tests:

```bash
pnpm release:bump 1.0.0
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

When publication is authorized, commit the verified release preparation and resolve
that commit as `AGENT_SKILLS_PUBLISH_SHA`. Show the diff from
`$AGENT_SKILLS_CANDIDATE_SHA` and require it to contain only the approved maintenance
and deterministic release preparation. Run the release checks from that clean exact
commit, tag that commit with the matching `v` prefix, and push the tag. Do not load the
publishing skill from one revision and tag another.

The GitHub workflow validates the version again, builds skill ZIPs, and creates the
GitHub release. Beta tags are marked as prereleases. Confirm the release succeeds
before testing remote installation.

Do not reuse or move a published tag. Prepare a new beta number or patch
version when a tagged release needs a correction.
