# Meteor November security releases: incremental catalog audit

## Run context

```text
Agent-skills target ref: main, verified against the GitHub branch API on 2026-11-13
Agent-skills revision: 0b022e17f4fcd7753440de79bd512603cf832de3; clean isolated worktree at audit start
Meteor remote: https://github.com/meteor/meteor.git
Meteor branch: release-3.6.1, release-3.5.5 and release-3.4.4; source read from immutable Git objects
Meteor revision: eaf134973529396b660078b705b9fa50a4747fd5; tagged source, excluding unrelated checkout changes
Meteor release context: official Meteor 3.6.1, 3.5.5 and 3.4.4
Meteor release tag: release/METEOR@3.6.1, peeled commit eaf134973529396b660078b705b9fa50a4747fd5
Meteor release branch revision: release-3.6.1 at fc2ed352674563b0e4eafcdd8c879ba6295f73cd
Audit mode: incremental
Comparison: Meteor 3.6..3.6.1, 3.5.4..3.5.5 and 3.4.3..3.4.4; catalog v1.1.0..main
Previous audit report: audits/skill-gaps/2026-11-10-meteor-3.6-stable-candidate.md, committed in 198f41b
Previous Meteor revision: e730097ce42a0dbc4c134aeb1706147b02112844
```

| Release | Previous tag commit | Target tag commit | Reviewed branch head |
| --- | --- | --- | --- |
| 3.6.1 | `e730097ce42a0dbc4c134aeb1706147b02112844` | `eaf134973529396b660078b705b9fa50a4747fd5` | `fc2ed352674563b0e4eafcdd8c879ba6295f73cd` |
| 3.5.5 | `dc46cfaa8f3d0bb455a9414c95883bba6756919b` | `fcced6e1c2dbdc95906b20d10a7c7c0352e8c43b` | `856d186c23ba56b54e5c93f7d87888537103ead8` |
| 3.4.4 | `37f5b51e39dde7a44573b320adc558cb518c4f86` | `80ef79fc1459a5fd34c2dc890a05aee5fc8170af` | `5fb8a1e8bfd421e2882735521e42c0d36140b968` |

The 3.4.4 and 3.5.5 branch trees equal their release tags. The 3.6.1
tag-to-branch difference is one CI runner setting, not application behavior.
Published catalog 1.1.0 and the reviewed default branch have identical
`skills/` content. The previous audit and its predecessor remain the baseline
for unchanged claims; this is not a fresh certification of every historical
API or platform. All 17 skills were inventoried for effects of these diffs.

## Source coverage

Read the three canonical entries under
`v3-docs/docs/generators/changelog/versions/` and compared their changes with
tagged source, documentation and tests. The 3.6.1 tag includes documentation
about catalog 1.1.0, but that does not establish a new catalog publication or
coverage of the November security fixes.

Primary evidence uses the target commits above:

- Accounts: `v3-docs/docs/api/accounts.md`,
  `v3-docs/docs/packages/service-configuration.md`,
  `v3-docs/docs/packages/accounts-express.md`,
  `packages/accounts-base/accounts_common.js`, `accounts_server.js`,
  `accounts_client.js`, `packages/accounts-password/password_server.js`,
  `password_tests.js`, `packages/accounts-oauth/oauth_tests.js`,
  `packages/accounts-express/fetch_client.js`, `accounts_express_client_tests.js`,
  and `packages/accounts-passwordless/passwordless_server.js` and method tests.
- Mongo: `packages/minimongo/local_collection.js`,
  `packages/mongo/mongo_connection.js`, `oplog_observe_driver.js`,
  `oplog_v2_converter.ts`, and the matching observer/converter tests.
- Native and tool: `tools/runners/run-hmr.js`, `run-hmr.test.js`,
  `tools/cordova/builder.js`, `builder.test.js`,
  `npm-packages/cordova-plugin-meteor-webapp/src/`, plugin tests,
  `tools/fs/files.ts`, `tools/tests/tarball.js`,
  `npm-packages/meteor-installer/extract.js` and `extract.test.js`.
- Backport build behavior: `packages/rspack/rspack_server.js`,
  `packages/webapp/webapp_server.js` and
  `tools/e2e-tests/regressions/rspack-static-assets.test.js` on 3.4.4/3.5.5.
- Runtime identities: each tagged `scripts/build-dev-bundle-common.sh`,
  release changelog and relevant `packages/*/package.js`.

Source inspection establishes the decisions below. The Meteor runtime suites
and native-device tests were not executed as part of this audit.

## Maintenance findings

| ID | Classification / priority | Skill or scope | Confirmed gap and evidence | Acceptance target |
| --- | --- | --- | --- | --- |
| S01 | Partial / high | Accounts password and OAuth references | Three-day verification expiry, password-change revocation and production `configureLoginService` restrictions are missing. Tagged Accounts source and docs establish defaults and server-only opt-in. | Expired/revoked links request a new email; milliseconds override days; production OAuth uses server configuration; older packages do not receive unsupported options. |
| S02 | Partial / high | Accounts authenticated fetch | `accounts-express` now limits automatic credentials to trusted origins. The catalog lacks the decision and `authFetchAllowedOrigins`; explicit headers remain caller-owned. | Distinguish page/ROOT_URL/explicit exact origins, client and server, automatic and explicit credentials, and cookie/CORS policy. |
| S03 | Outdated / high | Accounts cookie reference | A settings-only example says public settings enable both sides, despite server opt-in. Full endpoint protections are described only as 3.6, omitting 3.5.5's `accounts-base@3.3.2`. | Separate private/server and public/client settings; preserve Strict-cookie, refresh and HTTP/DDP-limit boundaries; include transient retry and logout cancellation on 3.5.5. |
| S04 | Outdated / medium | Accounts and security passwordless guidance | Validation/default-rate protection is presented as 3.6-only, but the tagged 3.4.4/3.5.5 packages backport it. This does not prove all 3.6 atomic completion behavior was backported. | Verify both package versions; preserve custom user data and sign-in-only policy; do not equate request validation with atomic token consumption. |
| S05 | Partial / high | Mongo and debugging | Live drivers now decline `$type`, negated `$elemMatch`, PCRE-only regex and divergent collations. Existing guidance covers only narrower `$where`/`$near` eligibility. | Preserve authorization selectors and polling; test initial and live exclusion; do not force live drivers or prescribe 3.5 reactivity configuration to 3.4. |
| S06 | Partial / high | Native HCP | Plugin 2.0.5 rejects unsafe manifest paths/version directories; installed native shells require a rebuilt binary to acquire the fix. | Correct invalid asset paths without bypasses; preserve legitimate internal paths and native/backend compatibility; no HCP-only native upgrade claim. |
| S07 | Outdated / medium | Deployment, installation, migration, testing and scaffolds | Current-task examples stop at 3.6/Node 26.13.0. Patched releases retain their respective Node majors. Archive containment failures also need a safer recovery branch than generic reinstall. | Use the selected release's exact runtime; default new 3.6-line examples to 3.6.1; retain historical feature floors and explicit older pins; do not disable extraction checks. |
| S08 | Partial / medium | Debugging | Patched HMR requires a valid app/secret even for Cordova; malformed messages are rejected. DDP protocol hardening is distinct from application method validation. | Keep development HMR separate from DDP and production HCP; preserve authentication/validation; avoid origin spoofing or logging secrets. |
| S09 | Partial / medium | Build debugging and Rspack | 3.4.4/3.5.5 backport static-asset lifecycle fixes. Request-derived manifest growth and missing-file handling are not explained for these Rspack 1 releases. | Verify paired `rspack`/`webapp` versions and missing-asset responses; avoid a forced Rspack 2 migration or generated-output edits. |

These findings block a claim that the next catalog is synchronized with this
security batch. They do not retroactively block the already published Meteor
security releases. No new skill, classification or bundle change is proposed.

## Skill claim matrix

The inventory below covers all skills. Unchanged claims retain the previous
audit's evidence. References and acceptance cases for affected claims are
included in the implementation scope.

| Skill | Affected claim / distributable surface | Evidence / status | Evaluation coverage |
| --- | --- | --- | --- |
| meteor-accounts | `SKILL.md`, password, OAuth, cookie and passwordless references; authenticated fetch | S01-S04: Partial/Outdated. Tagged Accounts docs, implementation and tests. | Existing cases 12-21, 24-25, 28-29 and 32-34 need their version boundaries preserved; add security-patch cases. |
| meteor-blaze | `references/pwa-scaffold.md` new-app release command | S07: select patched 3.6.1; PWA availability still starts in 3.6. Blaze rendering APIs unchanged. | Existing scaffold cases; no new rendering claim. |
| meteor-cli-installation | Runtime identification and archive-failure recovery | S07: tagged installer/tool and release Node pins. | Add containment failure and pinned-runtime checks; retain reset/reinstall safeguards. |
| meteor-community-packages | Adoption, source trust and independent package versions | Covered for this diff; no changed community APIs. | Existing package-adoption/version cases retained. |
| meteor-debugging | Build/HMR, DDP and query driver failure boundaries | S05/S08/S09: tagged source and focused tests. | Add protocol/HMR and asset lifecycle cases; Mongo case delegates to query guidance. |
| meteor-deployment | `SKILL.md` runtime table and Docker reference | S07: exact runtime updates; existing deployment trust guidance remains applicable. | Add three-line runtime matching case; preserve earlier-version and external database cases. |
| meteor-methods | Default Accounts rate rule and application method guards | Covered; generic rule mechanics unchanged. Accounts-specific backport guidance belongs to Accounts/security. | Existing matcher, authorization and error cases retained. |
| meteor-modern-build-stack | pnpm scaffold command; Rspack package pairing | S07/S09: 3.6 features unchanged, older static-asset fixes are package-pair specific. | Existing workspace cases; build-debugging backport case. |
| meteor-mongo-minimongo | Live driver eligibility, selectors and collation | S05: tagged guard and observer tests. | Add positive fallback and older-version cases; retain eligible-oplog pagination case. |
| meteor-native | `references/hot-code-push.md` manifest rejection/native upgrade | S06: native plugin 2.0.5 source/tests. | Add unsafe-path and installed-binary cases; retain compatibility-hash decisions. |
| meteor-pubsub | Cursor authorization, projections, retained document ownership | Covered with query-driver handoff to Mongo. No change to publication strategy or application authorization contract. | Existing publication authorization/reconciliation cases retained. |
| meteor-react | Render subscriptions, async results and Fast Refresh | Covered for this diff; no React integration API change. Generic HMR authentication diagnostics belong to debugging. | Existing reactive-hook and build-routing cases retained. |
| meteor-security | Accounts rate/backport boundaries and hardened framework baseline | S01-S05: route detailed decisions to Accounts/Mongo instead of duplicating APIs. | Add review of a patched backport without claiming every newer capability. |
| meteor-testing | `references/mocha-setup.md` runtime pairing | S07: current Node patch; no change to test driver APIs or test-selection behavior. | Existing runtime/native-dependency and test-discovery cases retained. |
| meteor-typescript | Accounts configuration declarations | Covered: tagged native declarations add the new options; existing regenerate/provider-preservation guidance applies. No provider migration required. | Existing native-provider and earlier-release cases retained. |
| migrate-to-meteor-3 | `references/other-breaking-changes.md` runtime table | S07: patch identities change, Meteor 2-to-3 API migration remains unchanged. | Existing runtime/compatibility cases retained. |
| migrate-to-rspack | `references/rspack-2-upgrade.md` target and runtime; earlier Rspack pairing | S07/S09: select 3.6.1 for a current 3.6-line upgrade without mislabeling Rspack 2 as new in the patch. | Existing earlier-version and native-runtime cases; backport asset diagnostics. |

## Version boundaries

These are verified release/package pairings, not a single monotonic package
floor across all release lines. Inspect the app's resolved package set.

| Meteor | accounts-base | accounts-password | accounts-passwordless | accounts-express | mongo / minimongo | Node |
| --- | --- | --- | --- | --- | --- | --- |
| 3.4.4 | 3.2.2 | 3.2.5 | 3.1.0_2 | Absent from this release | 2.3.2 / 2.1.2 | 22.23.5 |
| 3.5.5 | 3.3.2 | 3.3.1_2 | 3.1.1_2 | 1.0.0_1 | 2.5.2 / 2.2.0_2 | 24.22.3 |
| 3.6.1 | 3.4.1 | 3.3.3 | 3.1.2 | 1.0.1 | 2.6.1 / 2.2.2 | 26.13.1 |

## No-action and uncertain findings

- CI runner/triggers, release publication mechanics and private Galaxy image
  administration are maintainer concerns, outside distributable app skills.
- Oplog `__proto__` preservation, HTTP parser updates and warehouse hardening
  require a patched release, not application workarounds or new public APIs.
- Do not infer npm installer publication/default-dist-tag state from a Meteor
  source tag. Installer and framework versions remain separate.
- Native device execution, live provider authentication, production database
  fallback performance and independent contributor acceptance remain unverified.
- The previous release's contributor-acceptance waiver does not authorize a
  waiver for this update.

## Maintenance handoff

The user requested the Agent Skills update and its plan. Implement confirmed
S01-S09 in existing skills and their affected cases; preserve this report as
the pre-change evidence. Keep the private release-orchestration skill and
unrelated local changes outside this worktree. Record implementation results,
manual checks and the proposed publication sequence in
`docs/maintenance/2026-11-13-security-release-update.md`.

Catalog version preparation and publication are later steps. Do not reuse
v1.1.0 or describe an untagged candidate as a published companion release.
