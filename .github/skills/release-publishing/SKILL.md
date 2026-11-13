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

Local tests can use a private repository; public remote installs and directory
submissions require a public one. Independent catalog releases do not require
Meteor audits, compatibility mappings or artifact gates. Apply coordination
below only when intentionally pairing the catalog with a Meteor release.

Choose verification from the changed behavior, not the version label alone.
An existing-skill correction can go directly to stable when source review and
affected cases pass, distribution mechanisms are unchanged, and candidate
installation/update checks pass. Record why that path fits. A security-related
correction still needs its security boundaries checked; it does not automatically
need a beta. Prefer a tested beta for new distribution/client behavior, broad
routing or compatibility changes, or uncertainty that remote testing can resolve.
Never waive an observed failure because the version is a patch.

For direct stable, test upgrades from the previous stable release to the local
candidate, then repeat installs and upgrades from the exact published tag.
For beta promotion, verify the accepted beta and review/test any later delta;
publish another beta when that delta needs remote acceptance. Apply the review
evidence policy in `AGENTS.md`; do not invent independent contributor results.

## Preserve the release branch

For a beta or a catalog paired with a Meteor beta/RC, publish from the existing
release PR branch. Record its repository, branch, PR and freshly fetched head SHA.
Keep preparation, audits and post-publication records on that same branch/PR.
Leave the PR open and the branch unmerged after publication; do not merge, close
or delete either project's release branch/PR just to publish or finish cleanup.
Beta publication does not authorize merging either project's release PR.

Use the clean reviewed PR head as the beta candidate, not `main` or a synthetic
PR merge commit. Green CI must cover that exact content; default-branch CI alone
is insufficient. For stable publication, retain the reviewed, merged default-branch
candidate gate. Resolve merge authorization from the user's requested scope:
an end-to-end stable release can include the necessary catalog PR merge;
preparation alone cannot. Preserve any explicit no-merge instruction.
For beta/RC, if the PR is already merged/closed or its branch is missing, ask which
branch to use; do not silently create a replacement PR or rewrite history.

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

Before preparing the catalog version:

1. Require a completed release audit against the final Meteor release commit and a
   clean Agent Skills candidate from the freshly fetched release PR branch for
   beta/RC, or default branch for stable. If an earlier audit used uncommitted
   documentation or a different Agent Skills revision, require a new incremental
   report and preserve the earlier committed record.
2. Confirm every authorized release-blocking finding is implemented and its affected
   manual cases pass.
3. Confirm CI is green on the candidate commit. Beta/RC PRs remain open; only
   stable publication requires the authorized merge into the default branch.
4. Select the catalog version explicitly. A user may approve a new beta snapshot with
   no distributable skill change when the purpose is to record tested compatibility
   with a Meteor candidate.

Load this publishing skill from the same clean checkout and revision selected for the
release candidate. Record that commit as `AGENT_SKILLS_CANDIDATE_SHA`. If the selected
remote branch advances before version preparation, report the drift and explicitly
choose whether to keep the reviewed candidate or update it. Updating requires a new
audit of every affected catalog claim and another validation pass.

Publish the Agent Skills tag only after the paired Meteor packages, tool builds, and
bootstrap tarballs are live. Use the direct-stable or beta-promotion path above;
pairing with an official Meteor release does not itself require a catalog beta.

Record the exact mapping and live release URL in the handoff. Only a newly
published paired tag with passing remote tests gets a Meteor changelog section;
otherwise omit it. Follow `RELEASING.md` for its tested exact-tag command,
client-neutral format, guide link and installer runtime requirements.

## Prepare the version

Inspect the worktree first and preserve unrelated changes. Set the same global
version in both plugin manifests with:

```bash
pnpm release:bump 1.0.0-beta.1
```

Use a stable version after selecting and recording its verification path:

```bash
pnpm release:bump 1.0.0
```

Version the catalog tag and both manifests, not `package.json` or individual skills.

## Verify

Run the checks in `RELEASING.md`. The tag workflow rejects a tag that does not
match both manifests. Before publishing guidance for an official Meteor
release, complete [stable consolidation](references/verification-and-handoff.md#stable-consolidation).
For every release, use the same reference for complete-plugin packaging,
isolated installation/update checks and post-publication report retention.

Test from the working tree before publication. After pushing any release
tag, repeat the Codex, Claude Code, and individual-skill installations
from that exact tag.

For changes to release decisions, run the affected
[acceptance cases](references/eval-cases.md) in read-only fresh conversations.

## Publish

Treat preparation and publication as separate operations.

- A request to prepare a release authorizes local version changes and checks.
- A request to publish a release authorizes the requested commit, tag, push,
  and GitHub release flow. Resolve the necessary stable catalog merge as above;
  do not extend that scope to other repositories or beta PR cleanup.
- Marketplace submissions require the publisher account, approved listing
  details, and explicit authorization for that submission.

When publication is authorized, commit the verified preparation on the selected
branch and resolve it as `AGENT_SKILLS_PUBLISH_SHA`. Show the diff from
`$AGENT_SKILLS_CANDIDATE_SHA` and require it to contain only the approved maintenance
and deterministic release preparation. Run the release checks from that clean exact
commit, tag that commit with the matching `v` prefix, and push the tag. Do not load the
publishing skill from one revision and tag another.

For beta/RC, push preparation to the existing PR and confirm its head SHA and CI
before tagging. Add verified installation links and results to that same PR branch
after publication. These documentation commits do not move the published tag.

The GitHub workflow validates the version again, builds skill ZIPs, and creates the
GitHub release. Beta tags are marked as prereleases. Confirm the release succeeds
before testing remote installation.

Do not reuse or move a published tag. Prepare a new beta number or patch
version when a tagged release needs a correction.
