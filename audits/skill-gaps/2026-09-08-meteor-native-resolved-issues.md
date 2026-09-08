# Meteor native resolved-issue audit, 2026-09-08

## Run context

- Agent-skills target ref: `feat/coordinate-meteor-releases` (current checkout; remote freshness not established)
- Agent-skills revision: `20a036ddec4ddf53673f1d4fceb756f90ddce399`
- Agent-skills worktree: unrelated untracked `PR_DESCRIPTION.md`; no tracked changes at audit start
- Meteor remote: `https://github.com/meteor/meteor.git`
- Meteor branch: local checkout `integration/release-3.6-3.5.2-rspack-2.0`; source comparison pinned to local `origin/devel`
- Meteor revision: `7cb8141509a6e70972767f1106a2c708b5856efb` (pinned `origin/devel`)
- Meteor checkout HEAD: `878acf7d41c4e3ae7946ff1050e016c05b03313e`; only unrelated untracked artifacts; relevant implementation files match the pinned revision
- Meteor release context: Meteor 3.x application maintenance, with immutable release tags used for fix boundaries; not a release-publishing audit
- Audit mode: full review of the user-selected Cordova issue/forum scope and recovered native draft; not a full catalog audit
- Previous audit report: `audits/skill-gaps/2026-08-25-meteor-devel-full.md`, committed in `50f2fe4c7ce347749bb5daae1923bdb2504ef35d`, with later repository-hardening edits in `2e2109148a276dbf03aef8a155ea1c1fc25b0393`
- Previous Meteor revision: `5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe`; contextual baseline only, because that audit proposed a Cordova skill without implementing it
- Audit timestamp: `2026-09-08T10:38:21Z`

The native skill is absent from the current checkout. A recovered evaluation
snapshot contains `SKILL.md` and four references; the user authorized extending
this skill. Its saved review names catalog revision
`cfe59d766504dcdf51d47b29d94c1c575fe4c30f` and the pinned Meteor revision above.
That review is context, not fresh validation. Acceptance files were deliberately
withheld from the snapshot; 17 native prompts and three neighboring prompts
survive and can be restored as reviewable manual cases.

The recovered native entrypoint has SHA-256
`b91c3b164cc508fa56fe8d19d8dfcedfe8433611ef65fd4277c6f6f65a5eea28`.
The reference hashes, in filename order, are:

| Reference | SHA-256 |
|---|---|
| `build-and-distribution.md` | `acd2880d21bc99f12ded24b6f1a784164b92b94d20861546fc4bba2348c9c07f` |
| `configuration-and-plugins.md` | `47cefc9a04bf117696b46504098f38255a498729efc295ee6e666c1f72cfee26` |
| `hot-code-push.md` | `58d422046ee8dbed8adfd244dd24a780fd6e2c6e5dc1c94c611228d730243e23` |
| `toolchain-and-development.md` | `39b918230474872b9a06d61e97767cbc4951b12b7ade48320f5b20a7237ee3d9` |

## Source coverage and admission rule

Discovery used the user's [closed GitHub issue search](https://github.com/meteor/meteor/issues?q=is%3Aissue+is%3Aclosed+cordova+sort%3Aupdated-desc)
and [Meteor Forum](https://forums.meteor.com/). Authenticated GitHub searches
combined `cordova` and `Project:Mobile` with `updated:>=2024-07-15`, plus
Android/iOS title and hot-code-push searches created since that date. They
returned 75 unique closed issues. Three forum search pages for
`cordova after:2024-07-15 order:latest` returned 112 unique topics.
Titles, dates and scope were screened; bodies and human discussions were read
for 18 GitHub issues and 28 forum topics. This is a bounded review of those
search results, not a claim to cover every forum post.

Accept a finding only when it supplies an important application-development
decision missing from the draft, has explicit Meteor 3.x applicability, and
has a resolved solution supported by reporter/maintainer evidence plus current
documentation or implementation. A recent closure, a solved title, a proposed
patch, or an error log containing `web.cordova` is insufficient. Older threads
qualify only through explicit Meteor 3.x reproductions and resolutions.

Sources inspected include `v3-docs/docs/about/cordova.md`, `api/app.md`,
`troubleshooting/hot-code-push.md`, release changelogs, `tools/cordova/project.js`,
`tools/tool-env/meteor-config.js`, `tools/project-context.js`, `packages/url`,
`packages/ecmascript-runtime-client`, `packages/rspack`, `packages/webapp`, and
the native webapp plugin's manifest downloader. Upstream regression code was
inspected where available; no native-device reproduction was performed.

## Summary

| Classification | Count |
|---|---:|
| Partial | 6 |
| Outdated | 1 |
| New skill candidates | 0 |

These counts describe admitted maintenance findings. Covered, out-of-scope and
uncertain discoveries are recorded separately below. There is no release gate
decision in this audit.

## Skill claim matrix and maintenance findings

| ID | Classification / priority | Draft location and missing decision | Resolution and independent evidence | Acceptance |
|---|---|---|---|---|
| N01 | Partial / P1 | `hot-code-push.md`, failed-stage table: reaching the backend does not prove the proxy supplied the current manifest. | Meteor 3.2.2 reporter [confirmed disabling manifest caching restored production iOS HCP](https://forums.meteor.com/t/cordova-ios-hot-push-code/63707/6). At the pinned revision, `packages/webapp/webapp_server.js` creates the manifest with `cacheable: false`; `AssetBundleManager.swift` downloads `manifest.json` and selects its version. | New case 18: compare public/origin manifest version and caching before touching compatibility; case 19: fresh manifest plus actual plugin mismatch stays on binary rollout. |
| N02 | Partial / P2 | `configuration-and-plugins.md`, preferences: a copied `0x...` background color can break Android resource processing. | Meteor 3.3.2 [reporter-confirmed fix](https://forums.meteor.com/t/solved-migration-from-2-16-to-3-3-2-break-cordova-android-build/64274/2); corroborated by [an earlier report](https://forums.meteor.com/t/error-building-with-android/63124/3). Official docs corrected the example in commit [`0087dfb`](https://github.com/meteor/meteor/commit/0087dfb16cad9590cf5e59d770160c6befa66925). Use a supported `#` hex value without copying the thread's ambiguous color-name claim or malformed five-digit example. | New case 20: repair the actual preference, preserve unrelated settings, and distinguish a Gradle warning from the build failure. |
| N03 | Partial / P2 | `configuration-and-plugins.md`, plugin declarations: early Meteor 3 could lose generated dependencies when a plugin declared a transitive dependency. | [Issue 13303](https://github.com/meteor/meteor/issues/13303) includes reproduction, reporter-confirmed workaround, failure of the initial 3.0.4 fix, and final 3.1 resolution. [PR 13416](https://github.com/meteor/meteor/pull/13416), commit `c9da0c56b360debdb100087155553944247300cb`, reinstalls generated dependencies and is in `release/METEOR@3.1`. The [3.0.4 forum follow-up](https://forums.meteor.com/t/meteor-js-v3-0-4-is-out/62422/3) confirms explicit transitive-plugin declarations as the interim workaround. | New cases 21-22: on constrained 3.0.4, declare only the verified dependency; on fixed releases, investigate the real failure rather than pinning historical plugins. |
| N04 | Partial / P2 | `toolchain-and-development.md`, WebView failures: the old `url` package reports missing `core-js` even when the problem is its URLSearchParams integration. | [Issue 13450](https://github.com/meteor/meteor/issues/13450), [iOS confirmation](https://forums.meteor.com/t/meteor-meteor-3-0-4-meteor-run-ios-throws-several-errors-and-warnings/62514/17), [PR 13459](https://github.com/meteor/meteor/pull/13459). Commit `35270d8b0b8f2dc07087d4cbb2854401799fc409` is in Meteor 3.1, which ships `url@1.3.5` with `url-search-params-polyfill@8.2.5`. | New case 23: inspect resolved `url` and local overrides; use a compatible fixed package/release rather than removing accounts or repeatedly installing app-level `core-js`. |
| N05 | Partial / P1 | `toolchain-and-development.md`, WebView compatibility: modern transpilation does not by itself fix replacement of native Map/Set/Symbol implementations. | [Issue 13094](https://github.com/meteor/meteor/issues/13094) has explicit 3.0.2, 3.0.3 and 3.1.2 reports; [issue 13511](https://github.com/meteor/meteor/issues/13511) and [Vue/Meteor 3.4 reporter confirmation](https://forums.meteor.com/t/solved-vue3-does-not-work-with-cordova/61109/10) establish broader impact. Effective commit [`7db44d9`](https://github.com/meteor/meteor/commit/7db44d90d1ad7414c6efe8ab8c532ada5e7db3bc) is in Meteor 3.4.1; `ecmascript-runtime-client@0.13.0` preserves available native constructors. PR 13165 was closed without a GitHub merge commit; the effective commit and tagged code establish delivery. | New cases 24-25: distinguish runtime polyfills from bundle selection; preserve a required older branch and avoid editing global package caches or downgrading unrelated UI libraries. |
| N06 | Partial / P2 | `toolchain-and-development.md`, native development: Meteor 3.4 Rspack native runs could install the desktop HMR proxy and corrupt SockJS traffic. | [Issue 14154](https://github.com/meteor/meteor/issues/14154) includes maintainer reproduction and 3.4.1 resolution. [PR 14226](https://github.com/meteor/meteor/pull/14226), commit `f37f890bd8857c8fca4494340a7e1490a83afbfb`, is in Meteor 3.4.1. It guards both client dev bootstrap and server proxy setup; the tagged Atmosphere package is `rspack@1.1.0`. | New case 26: match native run mode and the resolved package, use the fixed integration, and do not treat every WebSocket failure as this bug. |
| N07 | Outdated / P2 | `toolchain-and-development.md` says 3.3.2+ always defaults to modern Cordova output. The capability exists, but affected published tools can normalize absent configuration to false. | [Issue 14358](https://github.com/meteor/meteor/issues/14358) and [PR 14411](https://github.com/meteor/meteor/pull/14411) establish the defaulting defect and its solution. Commit `8e49d38e79a0295cafcab6b8cd17e4c96498aa70` first appears in the inspected stable tags at Meteor 3.5.1; both 3.4.1 and 3.5 still contain `|| false`, whereas 3.5.1 uses nullish fallback. The PR includes `tools/e2e-tests/regressions/cordova-modern-default.test.js`. | Expand original case 14 and add case 27: preserve the 3.3.2 capability floor and explicit legacy opt-out; diagnose absent configuration on 3.4/3.5 and use a narrow explicit setting or fixed tool. |

### Delivery anchors

| Release tag | Commit | Relevant facts |
|---|---|---|
| `release/METEOR@3.1` | `815b674d9a0bf877ac844533a69a20fd14e37870` | Complete indirect-plugin fix; `url@1.3.5` |
| `release/METEOR@3.4.1` | `b350aadd6e81625f88c9c57c68d96790a2fec61d` | `ecmascript-runtime-client@0.13.0`; `rspack@1.1.0` native proxy fix |
| `release/METEOR@3.5.1` | `020cfbdf04e9d727ffff8bd7e1a1bc4fa5e73fa8` | Absent Cordova modern configuration fixed |
| `release/METEOR@3.5.2` | `4b13d6bb52c23f7bbb5df45d24af5a88bfd680f0` | Recovered draft's Android 15.1 / SDK 36 baseline |

Package fixes require inspecting `.meteor/versions` and app-local package
overrides. A release label alone does not establish the code actually loaded.
The report of success on 3.5 in issue 14358 does not prove the defaulting patch
shipped in that tag; source inspection sets the narrower 3.5.1 boundary.

## No-action and uncertain findings

| Sources reviewed | Disposition | Reason |
|---|---|---|
| [13475](https://github.com/meteor/meteor/issues/13475), [14180](https://github.com/meteor/meteor/issues/14180) | Covered / neighboring build scope | Native platform selection, server-only artifacts and preservation of HCP already have guidance. Browser architecture filtering belongs to the build skills; no duplicate tutorial. |
| [13250](https://github.com/meteor/meteor/issues/13250), [missing modules](https://forums.meteor.com/t/meteor-missing-modules/62354) | Separate installation failure | Confirmed old Windows installer/dev-bundle failure, fixed in 3.0.4. Avoid adding reinstall instructions to a native app lifecycle skill; broad installation diagnosis belongs outside this scope. |
| [requirements hang](https://forums.meteor.com/t/meteor-3-1-meteor-run-android-stuck-at-checking-platform-requirements/62682), [SDK discovery](https://forums.meteor.com/t/android-target-no-android-targets-sdks-installed/62365), [SDK 35](https://forums.meteor.com/t/cordova-target-api-version-35-or-higher/63742) | Covered | Draft already requires matching platform/SDK/JDK, actual host paths and command-line tools. Exclude later generic reset advice and Meteor 2 custom-tool instructions. |
| [plugin globals](https://forums.meteor.com/t/accessing-cordova-plugins/62629), [barcode scanner](https://forums.meteor.com/t/barcode-scanner-meteor-3-0-android/64328) | Covered / insufficient general value | Plugin-specific API exposure and compatibility are already delegated to the resolved plugin's documentation. Do not install a particular replacement scanner for every app. |
| [12958](https://github.com/meteor/meteor/issues/12958), [14117](https://github.com/meteor/meteor/issues/14117), [61109](https://forums.meteor.com/t/solved-vue3-does-not-work-with-cordova/61109) | Consolidated into N05 | The final confirmed fix supersedes intermediate Vue downgrades, router experiments and OS-update guesses. Issue 14117's ambiguous closure is not the evidence for N06. |
| [13800](https://github.com/meteor/meteor/issues/13800), [13652](https://github.com/meteor/meteor/issues/13652), [Minimongo thread](https://forums.meteor.com/t/minimongo-transpile-bug-with-meteor-3-3-on-ios-and-android/63787) | Outside native ownership | Acorn parsing and Mongo driver issues are not Cordova-specific. The Minimongo author explicitly found that changing transpilation did not solve the concurrency defect. |
| [13276](https://github.com/meteor/meteor/issues/13276) | Excluded | Large npm asset/bundler report; removing functionality unblocked one app but did not establish a reusable native repair. |
| [12974](https://github.com/meteor/meteor/issues/12974), [12946](https://github.com/meteor/meteor/issues/12946), [12708](https://github.com/meteor/meteor/issues/12708), [12448](https://github.com/meteor/meteor/issues/12448) | Excluded old reports | Meteor 2 or earlier reports with recent closure/activity. No distinct confirmed Meteor 3 solution beyond existing platform/plugin guidance. |
| [Blaze/Rspack blank app](https://forums.meteor.com/t/meteor-3-4-rspack-cordova-builds-appear-not-to-include-client-entry-point-javascript-code/64416) | Uncertain | Latest maintainer response still requests reproduction. An AI-derived `--production` workaround does not establish the claimed general mechanism or a durable fix. |
| [iOS memory-pressure white screen](https://forums.meteor.com/t/cordova-ios-white-screen-bug-fix-upstreaming-advice/63808) | Uncertain / app-specific | Reporter describes a title-dependent native override and its limitation. Do not generalize an app-specific heuristic into a framework repair or imply a shipped Meteor fix. |
| [Vite Android startup](https://forums.meteor.com/t/android-app-not-loading/63212), [production iOS](https://forums.meteor.com/t/app-breaks-in-production-on-ios/63179), [Google plugin build](https://forums.meteor.com/t/trouble-building-ios-with-accounts-google-1-4-1-cordova-plugin-googleplus/63166) | Uncertain | No confirmed complete native solution in these threads; partial workarounds, a change of stack, or unverified advice are insufficient. |
| [runtime backend selection](https://forums.meteor.com/t/let-user-enter-mobile-server-url-for-cordova-app-after-launch/62368), [camera background loss](https://forums.meteor.com/t/app-is-closed-in-background-on-using-camera-photo/62004), [macOS build](https://forums.meteor.com/t/problems-with-macos-15-2-update-resolved-was-some-other-lib/62703) | Excluded | No precise, verified Meteor 3 Cordova solution. A changed title is not enough. |
| [iOS restrictions](https://forums.meteor.com/t/enabling-ios-web-content-restrictions-breaks-meteor-cordova-apps/62227) | Excluded | User-controlled OS allowlisting and relaunch helped the reporter, but no explicit Meteor 3 version is established in the thread; the linked Meteor issue remains outside the closed-issue set. |
| [63158](https://forums.meteor.com/t/issue-run-meteor-ios-device/63158), [62472](https://forums.meteor.com/t/how-do-i-stop-meteor-cordova-default-splashscreen/62472), [62316](https://forums.meteor.com/t/ios-launch-screen-not-working/62316), [62111](https://forums.meteor.com/t/the-cordova-plugin-qr-barcode-scanner-plugin-is-having-problems-creating-apk-builds-after-updating-to-android-14-sdk-34/62111), [62107](https://forums.meteor.com/t/mobile-build-fails-when-update-android-version-to-34/62107), [62039](https://forums.meteor.com/t/unable-to-build-on-xcode-never-ending-pods-errors/62039) | Excluded Meteor 2 | Explicitly concern Meteor 2.x. Do not inherit whole-cache deletion, Node 14 patches, obsolete plugins or machine-reset advice. |

## Maintenance handoff

The user's request authorizes auditing resolved Meteor 3.x Cordova issues and
adding only useful, distinct solutions to the recovered `meteor-native` skill.
Implement N01-N07 in that existing draft's references, preserving its name,
workflow/build classification, `>=3.0` range, and lack of bundle membership.
Restore the draft into the current catalog because it is absent here; do not
import unrelated skills or other changes from its evaluation snapshot.

Restore the surviving native prompts as `references/eval-cases.md`, add the
cases named above, and carry over only the native ownership handoffs in
debugging/deployment with their three prompts. Keep findings and raw evidence
outside distributable skill folders. No additional skill, package catalog,
public comment, issue closure or release is authorized by this handoff.

This report was written before skill edits. Run repository validation, link
checks, catalog consistency, tests and ZIP inspection after implementation.
Record fresh behavior-check outcomes separately from the historical saved
review. Outside-contributor Claude Code/Cursor acceptance and physical-device
verification cannot be inferred from text-only evaluations.

## Implementation verification

Implemented N01-N07 in the recovered native references. Restored the unchanged
native entrypoint, its four references, and 17 surviving native prompts; added
10 cases for the admitted findings. Added only the three neighboring handoff
cases and their debugging/deployment guidance, then regenerated the catalog.
Classification and bundle membership remain as specified in the handoff.

Fresh Claude Code conversations received the exact case prompts and skill
context, with acceptance criteria and previous answers withheld. Native checks
received the native body and reference material; routing checks received the
catalog descriptions and relevant skill bodies. Tools, session persistence,
external MCP configuration and personal settings were disabled. These checks
evaluate the supplied guidance, not native application execution or automatic
skill loading in an installed client.

| Cases | Initial outcome | Final outcome |
|---|---|---|
| Native 1, 4, 14, 17-22, 24-26 | Pass | Pass; case 14 also rerun after the modern-configuration clarification |
| Native 23 | Fail: omitted the app-local `url` override check | Pass after making the override check explicit in the repair row |
| Native 27 | Fail: `{ "cordova": true }` enabled other modern options, and the answer incorrectly required a binary solely for changed JavaScript output | Pass after documenting preserved effective options and the actual native-compatibility decision |
| Debugging 19; deployment 15-16 | Pass | Pass |

The initial result was 15/17 distinct cases passing; after corrections, all
17 selected cases passed. The other restored native cases were not freshly
run in this audit. Raw responses, temporary runners and recovered historical
review material remain outside the repository.

The case 27 correction was independently checked by executing the unchanged
`normalizeModernConfig` implementation extracted from the
[Meteor 3.5 tag](https://github.com/meteor/meteor/blob/3f23e5e402cf9091a4515cb94130b6a0a9ced11e/tools/tool-env/meteor-config.js).
For the affected absent-setting scenario, the documented explicit object
changes only `cordova`; the abbreviated object also enables `transpiler`,
`minifier`, `webArchOnly` and `watcher`. Source review of
`tools/isobuild/bundler.js` and
`packages/webapp-hashing/webapp-hashing.js` confirmed that the native
compatibility hash uses the platform and plugin versions, rather than the
modern JavaScript output flag alone.

| Repository check | Result |
|---|---|
| Frozen-lockfile installation with Corepack pnpm 9.12.0 | Pass; no lockfile change |
| `pnpm run validate` | Pass: skill, audit and plugin validation |
| `pnpm run check-links` | Pass; all 12 distinct native documentation links also checked separately |
| `pnpm run catalog:check` | Pass |
| `pnpm test` | Pass: 33 tests across five files |
| `pnpm run build:zips` and independent ZIP inspection | Pass: all 15 archives match source paths and bytes; native archive has six files; no maintenance evidence included |
| `git diff --check` | Pass |

The host's pnpm shim was unavailable, so checks used Corepack and a temporary
pnpm wrapper for nested scripts. No repository tool configuration was changed.
Outside-contributor Claude Code/Cursor acceptance remains required before a PR
is accepted. Physical-device, emulator, signing, store upload and live HCP
verification were not performed. No issues, forum posts, releases or PRs were
created or modified.

## Integration with PR 16

The subsequent PR request was prepared on `chore/meteor-3.5.2-skills` at
`cfe59d766504dcdf51d47b29d94c1c575fe4c30f`, the verified head of
[PR 16](https://github.com/meteor/agent-skills/pull/16). The native contribution
uses `feat/meteor-native-resolved-fixes` and targets that branch. Merge it into
PR 16 before merging PR 16 into `main`.

Preserved PR 16's existing release guidance and acceptance cases. The native
debugging handoff is case 24 on this base, corresponding to case 19 in the
earlier audit snapshot; deployment cases remain 15-16. The combined catalog
contains 16 skills because the PR base also includes `meteor-cli-installation`.

Five fresh Claude Code integration conversations used this combined catalog,
the three relevant skill bodies, native references, and debugging's mobile
and build references. Prompts were unchanged and criteria remained hidden.

| Case | Initial outcome | Final outcome |
|---|---|---|
| Debugging 22 | Incomplete: correct SDK/platform repair, but omitted the bundled Cordova tooling version | Pass after repeating the bundled `cordova-lib@13.0.0` check in the toolchain reference |
| Debugging 23-24; deployment 15 | Pass | Pass |
| Deployment 16 | Fail: unnecessarily claimed every release/configuration-file change changes the native compatibility hash | Pass after reconciling the inherited debugging statement with actual native changes and clarifying what the hash covers; expanded this case's criteria |

The integration correction distinguishes platform/plugin versions, generated
native configuration, and a Meteor release label. Native permission or
configuration changes can require a new binary even when the compatibility
hash is unchanged. This uses the source evidence already recorded above and
adds no new unresolved-issue advice.

Final combined-base checks passed: frozen-lockfile installation, dependency
audit at moderate severity, repository validation, links, catalog consistency,
33 tests, ZIP generation, and `git diff --check`. Independently inspected all
16 ZIPs for exact source paths and bytes and exclusion of maintenance evidence;
the native ZIP contains six files. All five selected integration conversations
passed after the two corrections. Outside-contributor acceptance and native
device/signing/live-HCP verification remain pending as described above.
