# First stable Meteor Agent Skills release

The confirmed content gaps are fixed. Distribution packaging and Core docs are
prepared. The remaining steps are acceptance and publication, with optional
directory submissions after publisher approval.

Review [Agent Skills PR #37](https://github.com/meteor/agent-skills/pull/37)
and [Meteor Core PR #14993](https://github.com/meteor/meteor/pull/14993).
The Core changes use a separate worktree; the existing Core checkout and
unrelated files are preserved. No tag, release, merge or directory submission
was performed.

## Source baseline

The [immutable audit](../../audits/skill-gaps/2026-11-10-meteor-3.6-stable.md)
compares Agent Skills `main` at `9f41f992bbaa9705d4c18ae766b24e7f9e62a997`
with official Meteor 3.6 at `e730097ce42a0dbc4c134aeb1706147b02112844`.
The release branch head `092fa6f6057ce6eb53bb04b3561291e73838fd8c` adds two
documentation corrections after that tag, without runtime changes.

The first consolidation was committed as
`7c4905f73398ec9150ec1782624553d3216fabb1`. This follow-up implements audit
findings S03-S07 and the pre-publication part of S08. The original audit stays
unchanged as evidence of what was missing.

Core docs are based on `devel` at
`e587c05d3a`, with documentation commit `e97a594bde`. Runtime claims remain
checked against the final 3.6 tag, not inferred from current `devel`.

## Completed content work

Distributed guidance now uses official Meteor 3.6. It has one stable release
row, final runtime/package identities and explicit earlier-version branches.
It no longer describes Meteor 3.6 betas, RCs or intermediate feature arrivals.
Historical audits and catalog release records retain their original versions.
Independent Blaze package prereleases retain their own compatibility guidance.

| Audit finding | Implemented guidance | Acceptance cases |
|---|---|---|
| S01-S02 | Stable 3.6 commands, Node 26.13.0/npm 11.20.0, final Rspack package pairings and native TypeScript scaffold defaults. Existing apps preserve their provider. | Prior consolidation: 8 targeted cases passed. |
| S03 | `mongo@2.6.0` requires MongoDB 6.0.9+/7+; split-event reassembly, interrupted-fragment resume and non-resumable observer resync. Earlier package behavior and eligible oplog/polling fallback remain explicit. | Mongo 13-16. |
| S04 | Native Google audience/ID-token/subject checks and owned `additionalClientIds`; Facebook app-ID and identity checks. Verified 3.5.3 package backports are documented. Browser OAuth keeps its existing flow. | Accounts 2, 30-31. |
| S05 | Passwordless user tokens respect 2FA; missing/invalid codes preserve the token; consumption is atomic and single-use. Email-code verification differs from user-level tokens. Stale email-verification links cannot authorize a different address. | Accounts 32-34. |
| S06 | Trusted Galaxy discovery destinations, rejected lookalike hosts, and deliberate `DEPLOY_HOSTNAME` overrides. Older tools require their own backport check. | Deployment 24-25. |
| S07 | App-owned `Meteor.UserServices` augmentation, optional fields and provider-specific OAuth declaration diagnostics. Generated files remain unedited. | TypeScript 18-19 and a real 3.6 scaffold/type-check. |
| S08 | Core guide covers all 17 skills, explains catalog versus framework versions, and links from `meteor create`. | Core PR #14993; coverage, link checks and a successful docs preview. |

Sources: [Change Streams](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/v3-docs/docs/performance/change-streams-observer-driver.md),
[Google](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/packages/google-oauth/google_server.js),
[Facebook](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/packages/facebook-oauth/facebook_server.js),
[passwordless](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/packages/accounts-passwordless/passwordless_server.js),
[email verification](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/packages/accounts-password/password_server.js),
[deployment discovery](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/tools/meteor-services/deploy.js),
and [native user declarations](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/packages/meteor/meteor.native.d.ts).

## Packaging and distribution

The existing repository marketplaces remain the distribution strategy. We do
not need an npm package, another repository or an MCP server.

`pnpm run build:plugin` now produces `dist/meteor-plugin.zip`: both plugin
manifests, marketplace files, the shared Meteor icon, license and all 17
skills. The tag workflow publishes it beside the individual skill ZIPs.
Packaging tests reject symlinks/unexpected skill files, preserve source bytes,
and exclude audits, maintainer workflows, dependencies and nested ZIPs.
Ordering and timestamps are fixed for repeatable builds; script executable
bits are preserved.

The plugin manifests reference the unmodified Meteor organization avatar.
Both Claude strict validators pass without the previous missing-icon warning.
The image is 298 x 298; an approved larger original remains a directory
submission item where 512+ pixels are required. Provenance is in
[assets/README.md](../../assets/README.md).

The [release notes and listing draft](first-stable-release-notes.md) are ready
for review. OpenAI and Anthropic directory submissions remain separate from
repository installation. They require publisher access, accepted listing
information and submission authorization. Directory approval does not block
the repository/GitHub release. See [OpenAI packaging](https://developers.openai.com/plugins/build/plugins),
[OpenAI submission](https://developers.openai.com/plugins/deploy/submission),
and [Claude publishing](https://code.claude.com/docs/en/plugins/publish).

## Verification

| Check | Result |
|---|---|
| Frozen pnpm install, validation, links and catalog consistency | Passed with pnpm 9.12.0 through the pinned npx runner. No global installation changes. |
| Automated suite | 38 tests across 6 files, including complete-plugin packaging and missing-artwork checks. |
| Dependency audit | No known vulnerabilities at the moderate threshold. |
| Claude marketplace and plugin strict validation | Passed on Claude Code 2.1.312, without missing-icon warnings. |
| Archives | 17 individual ZIPs with 119 source files; complete plugin ZIP with 125 files. Byte comparisons passed; maintenance evidence is excluded. |
| Meteor prerelease scan | No Meteor 3.6 beta/RC pins in distributed Markdown or ZIP contents. |
| Manual guidance cases | 14 fresh conversations: Mongo 13-16; Accounts 2 and 30-34; Deployment 24-25; TypeScript 18-19. Criteria hidden; results reviewed. |
| Repository marketplace installation | Codex 0.164.0 and Claude Code 2.1.312 installed the extracted full plugin in isolated filesystem profiles. Codex remove/reinstall also passed. |
| Installed-plugin conversations | Both clients loaded the Mongo skill and recovery reference from the local candidate. A pagination inference in the first Claude run led to separate oplog eligibility guidance and case 16; the installed-plugin rerun passed. |
| Skills CLI | Version 1.7.6 installed one skill and all 17 into a disposable project; selected-skill replacement verified. |
| Actual Meteor workflow | Official `meteor --release 3.6 create --typescript` generated native declarations. `meteor types` and the scaffold's TypeScript 7 checker passed with the new augmentation. A wrong assignment failed with TS2322; restoring it passed. |
| Core docs | All 17 skill owners represented; new link resolves; four VitePress theme-link tests pass; formatting/lint hooks pass. |
| Whitespace | `git diff --check` passed in both repositories. |

The local plugin tests used the working candidate with the unchanged
`1.1.0-beta.3` manifest version, in disposable profiles. They do not claim the
published beta contains these changes. Real user plugin settings were not
modified. Raw prompts, responses, generated applications and installation
profiles remain outside the repository.

The Core docs preview is available at
https://deploy-preview-14993.docs-online.meteor.com/ai/agent-skills.

The behavior cases are author-side guidance checks. They are not the required
outside-contributor acceptance and do not prove production Mongo recovery,
native-device login or a full Meteor runtime regression suite. Exact-tag
installation and beta-to-stable upgrade tests must run after publication.

## Remaining release steps

1. Obtain outside-contributor acceptance for the changed high-risk guidance.
   [AGENTS.md](../../AGENTS.md#how-a-skill-is-reviewed) requires:
   “For a new skill, routing change, or high-risk guidance change, at least one
   outside contributor runs the affected cases in `references/eval-cases.md`
   against Claude Code or Cursor.” Record reviewer, client and outcomes on
   PR #37. The focused case matrix above is ready to run.
2. Select the next catalog version. Recommended sequence: `1.1.0-beta.4`,
   then `1.1.0`. Keep the same preparation PR open for the beta. The
   [release-publishing skill](../../.github/skills/release-publishing/SKILL.md)
   requires: “If its guidance changed afterward, publish and test another beta
   before stable promotion.” These are catalog test releases; their guidance
   describes official Meteor 3.6.
3. Pin the reviewed clean candidate and require green CI on that exact commit.
   Preserve the source audit and record an incremental final-candidate audit
   if the candidate drifts. Bump both manifests using `pnpm release:bump`,
   record the exact Meteor-to-catalog mapping and rerun deterministic checks.
4. Publish the selected beta when authorized. Verify its 18 release assets,
   exact-tag Codex/Claude/Skills CLI installs, loaded references and updates
   from the previous beta. Record the tag target and installation hashes.
5. After acceptance, authorize the merge and stable publication. The release
   skill says: “A merge requires a separate explicit user request, including
   during stable promotion.” Promote from the reviewed default-branch commit,
   bump to `1.1.0`, replace README beta status/pins, move the Unreleased
   changelog entry, and publish the stable tag. Repeat exact-tag installations
   and the beta-to-stable update path.
6. Merge the Core documentation PR when approved. After the stable tag is live
   and verified, add its real pinned command and paired Agent Skills section
   to the Meteor 3.6 changelog, then regenerate Core history. The publishing
   skill permits that section only after successful remote installation.
7. Verify the paired Meteor packages, tool builds and bootstrap artifacts
   before tagging. The Linux 3.6 tool/scaffold was exercised here; that does
   not verify every platform bootstrap. GitHub `/releases/latest` still points
   to 3.5.3. The Meteor release owner should confirm whether that is deliberate
   before changing public recommendation metadata.
8. Announce the release with the reviewed notes and assign feedback ownership.
   Submit directory listings once account details, artwork and approval are
   ready. The existing installation channels can ship before directory review.

The original “PostgreSQL and create API” wording was interpreted as the Agent
Skills page and `meteor create` documentation. No PostgreSQL integration was
added. It is not a dependency of this catalog launch.
