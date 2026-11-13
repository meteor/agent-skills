# Agent Skills update for Meteor 3.6.1 and security backports

The initial beta/outside-contributor plan below was superseded by the owner's
request for verified direct stable publication and proportionate release rules.
Current verification and publication status lives in [the 1.1.1 handoff](../releases/v1.1.1.md).
The original implementation and evaluation history is retained here.

## Scope and plan

Use the [incremental audit](../../audits/skill-gaps/2026-11-13-meteor-security-releases.md)
to update the existing catalog for Meteor 3.6.1, 3.5.5 and 3.4.4. All 17
skills are included in the impact inventory; only affected content changes.
Keep historical feature introductions and earlier-version fallbacks.

1. Pin the published framework tags and current catalog base; compare each
   backport with its own previous release. Preserve the audit before editing.
2. Implement S01-S04 in Accounts and its security handoff: verification-token
   expiry/revocation, production OAuth configuration, authenticated fetch,
   correct cookie settings and backported request validation.
3. Implement S05-S06: Mongo selector fallback and native manifest/binary
   compatibility. Preserve selectors, authorization and native safety checks.
4. Implement S07-S09: runtime verification, safe extraction diagnostics,
   HMR/DDP boundaries and Rspack static-asset backports.
5. Run affected behavioral cases in fresh conversations with hidden grading
   criteria. Keep supplied-text, installed-discovery and runtime evidence
   distinct. Request outside-contributor acceptance for changed high-risk
   guidance before release; author-side checks do not satisfy that requirement.
6. Run frozen dependency installation, repository validation, link/catalog
   checks, tests, individual ZIP builds and complete plugin build. Inspect
   changed content and ensure internal evidence is absent from artifacts.
7. Prepare a reviewable change with source links, case results and limitations.
   Refresh source/catalog revisions before starting publication.

## Proposed release sequence

Propose `1.1.1-beta.0`, followed by stable `1.1.1` after acceptance. This is
a catalog correction/update within the existing skills and compatibility
scope, not a new Meteor framework version or a new skill bundle. Confirm
the version against the final diff and available tags before bumping it.

Follow the repository's release-publishing workflow: validate the exact
candidate, publish and test a new beta, exercise exact-tag installs and
upgrades, then promote accepted contents to stable. Keep catalog manifests at
their current version during content preparation. Do not move the published
v1.1.0 tag or call the current draft a published release.

The Meteor security releases are already live. Track catalog completion as
follow-up work and announce its exact tag only after publication and remote
installation verification. The private release-skill clarification is a
separate future change on the branch the user will provide.

## Implemented changes

Prepared on `update/security-release-guidance`, based on
`0b022e17f4fcd7753440de79bd512603cf832de3`. The pre-change audit is preserved
in commit `8a8975f68c72f8d3aab43a74008060a5a750b87f`.

All 17 skills received an incremental impact review. Twelve change; community
packages, methods, pubsub, React and TypeScript retain their existing guidance
and the earlier audit baseline. This is not a fresh certification of every
historical claim in those skills.

| Findings | Implemented surface |
|---|---|
| S01-S04 | Accounts password/OAuth/cookie/passwordless references, a new authenticated-fetch reference, routing keywords, and security handoffs. Exact backport pairs distinguish request hardening from atomic completion and later expiry/revocation. |
| S05 | Mongo live-selector eligibility and polling guidance, with a debugging handoff and a separate 3.4 branch. |
| S06 | Native manifest rejection and the requirement to rebuild/distribute binaries for plugin 2.0.5. |
| S07 | Project/bundle runtime inspection in installation, deployment, testing and migration references; 3.6.1 scaffold/upgrade commands; archive containment recovery. Historical feature floors remain intact. |
| S08-S09 | Development HMR authentication, DDP protocol boundaries and Rspack 1 static-asset backports in debugging/build references. |

No bundle, classification or minimum Meteor range changes. Catalog manifests
remain at 1.1.0 pending a separate release preparation step.

## Verification results

### Initial implementation

These results describe `b45c905ef0a5225349cf0ded99559b7a5c8ae0dc`, before
the simplification below. Author-side behavior checks used Claude Code 2.1.312, its configured
`claude-opus-5-5` model, and fresh non-persistent conversations. Grading
criteria were not supplied. Twenty new cases and six existing regressions
passed after the corrections below:

| Skill | Cases | Setup and final result |
|---|---|---|
| Accounts | 12, 19, 28, 29, 33-42 | Supplied skill and relevant reference text; 14 passed. |
| Mongo/Minimongo | 17-19 | Supplied skill and selector reference; 3 passed. |
| Native | 29-30 | Supplied skill and HCP reference; 2 passed. |
| Debugging | 45-47 | Supplied skill and build/DDP reference; 3 passed. |
| CLI installation | 26-27 | Supplied skill and recovery/runtime reference; 2 passed. |
| Deployment | 26 | Supplied skill and Docker reference; passed. |
| Security | 14 | Supplied skill; passed the backport/application-guard decision and requested the Accounts handoff for exact package details. |
| Accounts discovery | 38, 42 | Locally loaded complete plugin ZIP contents with read-only tools; both passed. The trace selected `meteor:meteor-accounts` and read `authenticated-fetch.md`. The server-worker near miss rejected the client-setting repair. |

Early responses exposed ambiguity between the original 3.6 feature floor and
the 3.6.1 package pair, applied later expiry/revocation to an older atomic
verification package, described unknown configuration options as harmless,
and narrowed fetch coverage to only the accounts-express export. The owning
references now distinguish these boundaries explicitly; affected cases were
rerun and their final responses inspected. Prompts 35 and 41 were also clarified
to ask explicitly about all the behavior their criteria grade.

Supplied-text checks demonstrate use of the provided guidance, not automatic
discovery. The two local plugin checks demonstrate routing/reference loading,
not remote installation or application runtime correctness. Raw outputs and
temporary projects are outside the repository.

Repository checks passed with Node 22.22.0 and pinned pnpm 9.12.0:

- Frozen dependency installation.
- Skill/plugin validation and source-link checks.
- Catalog regeneration/check, with no generated catalog diff.
- All 43 tests across seven test files.
- All 17 individual skill ZIPs and the complete plugin ZIP.
- Archive inspection: all 246 file entries match source bytes, including the
  126-file complete plugin; no internal skills, audits or maintenance docs.
- `git diff --check`.

The initial local plugin artifact SHA-256 was
`fdbc746e1ef128e9cc4b74502832554adebf1357d28c5f66ebe6750a9b9e8970`.
Its 1.1.0 manifest is the unchanged working version, not a new publication or
a replacement for the existing 1.1.0 artifact.

### Simplification decisions

The follow-up keeps application decisions and removes repeated patch history.
The committed audit remains unchanged.

| Treatment | Reason |
|---|---|
| Replace repeated Node patch maps with project commands and bundle metadata | The installed runtime is authoritative for CI/images; copying pins across skills adds drift without changing the decision. Runtime cases now supply command/bundle evidence and still require correct per-project selection, image verification and native rebuilds. |
| Consolidate passwordless history and cookie retry explanations | One package table distinguishes request hardening from atomic completion; one retry rule preserves logout cancellation. |
| Keep Accounts, Mongo and native compatibility boundaries | These prevent unsupported configuration, weakened authentication, forced live selectors or assuming HCP updates native code. The authenticated-fetch reference remains because browser/server and explicit/automatic credentials change advice. |
| Trim HMR/DDP/resolver internals | Keep the failing symptom, compatible patch and safe action. The HMR byte limit and resolver implementation ordering belong in framework docs, not general recovery guidance. |
| Update internal audit/maintenance skills and the authoring contract | Require a changed agent decision before adding guidance, particularly for patches. Record material keep/trim/docs-only reasons outside published skills; preserve standalone use and meaningful behavioral criteria. |

Three internal acceptance cases cover patch triage and simplification without
losing compatibility. The maintainer instructions themselves consolidate
existing workflow repetition to stay within the body limit.

### Checks after simplification

Author-side supplied-text checks used the same Claude Code client/model and
fresh non-persistent conversations with hidden criteria. Twenty-five affected
cases passed on the final relevant guidance:

| Skill | Cases |
|---|---|
| Accounts | 12, 19, 28, 29, 33-36, 40-41 |
| Debugging | 45-47 |
| Native | 29-30 |
| Security | 14 |
| CLI installation | 27 |
| Deployment | 17, 20, 26 |
| Testing | 20 |
| Meteor 3 migration | 33 |
| Internal maintenance | 3-4 |
| Internal gap audit | 3 |

Responses were inspected against their criteria. Follow-up runs corrected an
ambiguous unsupported-option sentence, a missing deployment handoff, and
maintenance wording that could confuse runtime pins with capability floors.
The native check also exposed an existing instruction treating
`.meteor/versions` as Cordova plugin inventory; it now selects native build
metadata. This is supported by `tools/cordova/project.js`'s
`listInstalledPluginVersions` at Meteor 3.6.1 commit
`eaf134973529396b660078b705b9fa50a4747fd5`. Case 29 now explicitly checks that
distinction. All affected follow-up responses passed.

The initial installed-discovery results above remain historical; routing and
plugin metadata were unchanged in this simplification. These new supplied-text
runs do not establish installed discovery or application runtime correctness.

Frozen installation, validators, links, catalog checks and all 43 repository
tests passed. Rebuilt and inspected all 17 skill ZIPs plus the complete plugin:
all 246 entries match source bytes, including 126 plugin files, with internal
skills and maintenance evidence excluded. Final plugin SHA-256:
`b41ebf3546491a71addc3070a789874c8433939f2bce9bbeaaa816cb0a7e9985`.
The candidate is the simplification commit containing this record, based on
`b45c905ef0a5225349cf0ded99559b7a5c8ae0dc`; manifests remain at 1.1.0.

## Remaining release steps

1. Review the source change and get at least one outside contributor to run
   the affected cases in Claude Code or Cursor, as required by
   [AGENTS.md](../../AGENTS.md#how-a-skill-is-reviewed). Author-side results
   above do not satisfy that requirement; the previous release's waiver
   does not transfer.
2. Refresh public Meteor tags and catalog main, reconcile any intervening
   changes, and rerun checks affected by the resulting diff.
3. Follow [release-publishing](../../.github/skills/release-publishing/SKILL.md)
   to confirm/bump the candidate version, validate and publish the proposed
   `1.1.1-beta.0`, and test exact-tag installation and upgrade paths.
4. Promote accepted content to `1.1.1`, verify remote artifacts/installations,
   then announce the exact published tag as the security-release catalog
   follow-up. Do not imply every skill changed or that 1.1.0 already contained
   these updates.

No new catalog tag, GitHub release, remote installation test or Slack message
has been published by this work. Meteor runtime suites, native devices, live
OAuth providers and production database performance were not exercised.
The private release-orchestration skill still waits for the user's branch.
