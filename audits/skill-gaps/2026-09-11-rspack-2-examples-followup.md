# Rspack 2 examples follow-up audit

## Run context

```text
Agent-skills target ref: release/v1.1.0-beta.0, explicit maintenance target
Agent-skills revision: 919097a901fdcbf7831d66cd9348c6018a263b32; clean at audit start
Meteor remote: https://github.com/meteor/meteor.git
Meteor branch: release-3.6
Meteor revision: 7bd27aafe325137f488580cb910a5a1a7f92d373; no tracked changes
Meteor release context: 3.6-beta.0, release/METEOR@3.6-beta.0
Audit mode: incremental, requested Rspack migration follow-up
Comparison: Agent Skills 1670aad3a873b9863bc89e88e1c7592d8638592b..919097a901fdcbf7831d66cd9348c6018a263b32; additional examples and upstream evidence
Previous audit report: audits/skill-gaps/2026-09-11-meteor-3.6-beta.0.md, committed in 7ca527ac6e67fe5f347974d349d3347ba601f93f
Previous Meteor revision: 7bd27aafe325137f488580cb910a5a1a7f92d373
Examples remote: https://github.com/meteor/examples.git
Examples comparison: 764182952a3bd46c307369d2551dd944874c58dc..a7f001d3479a6f9088c80fe1016829385e74bfda
Examples context: PR #50, open at review on 2026-09-11
```

This audits the requested local review candidate, not a freshly synchronized
default branch or a final publication candidate. Meteor has not changed since
the previous audit. Its untracked article drafts and artifacts remain outside
the evidence and untouched. Unaffected catalog claims retain the prior audit;
this is not a new full-catalog or third-party API audit.

## Source coverage

Meteor paths refer to the revision above. External documentation was reviewed
on 2026-09-11; the examples are pinned to their PR head, not assumed merged.

| Evidence | Reviewed material |
|---|---|
| E01 | `v3-docs/docs/generators/changelog/versions/3.6.0.md`; `v3-docs/docs/about/modern-build-stack/rspack-bundler-integration.md`, required dependencies, SWC configuration, workspaces and CI; `packages/rspack/lib/dependencies.js`, startup call in `rspack_plugin.js`, and `ensureRspackConfigExists` in `lib/build-context.js`. |
| E02 | `npm-packages/meteor-rspack/rspack.config.js`, explicit client/server roots and extensions, CommonJS output, parser settings; `lib/meteorRspackConfigFactory.js`, configuration composition; `lib/swc.js`, Meteor-owned SWC configuration loading. |
| E03 | [Examples PR #50](https://github.com/meteor/examples/pull/50), body and changed files; manifests, lockfiles, Meteor release files, Complex Todos `tsconfig.json`, unchanged Svelte Rspack configuration and Notes Offline `.swcrc` at `a7f001d3479a6f9088c80fe1016829385e74bfda`. |
| E04 | Official [Rspack 1-to-2 guide](https://www.rspack.dev/guide/migration/rspack_1.x) and [Rspack 2 announcement](https://www.rspack.dev/blog/announcing-2-0), runtime, configuration, resolution and plugin compatibility changes. |
| E05 | Official [Lingui SWC plugin reference](https://lingui.dev/ref/swc-plugin) and [SWC plugin compatibility guidance](https://swc.rs/docs/plugin/selecting-swc-core); [Svelte preprocessor TypeScript documentation](https://github.com/sveltejs/svelte-preprocess/blob/main/docs/preprocessing.md#typescript). |

The examples report release updates and successful startup for Complex Todos,
Notes Offline, Parties, Task Manager, and Tic-Tac-Toe. That report is not
independent evidence of browser suites, offline behavior, or production tests.
No example runtime or model acceptance test was executed during this audit.
No new Meteor implementation comparison or separately supplied docs-gap
report applies. Prior Meteor test evidence remains in the baseline report.

## Summary

Counts represent maintenance findings, not each claim in the matrix.

| Classification | Count |
|---|---:|
| Outdated | 1 |
| Partial | 3 |
| Overlap | 0 |
| Candidate | 0 |
| Uncertain | 0 |

## Release blockers

| Finding | Skill | User impact | Required action |
|---|---|---|---|
| F01 | `migrate-to-rspack` | The body makes a separate npm update mandatory and routes an existing Rspack upgrade through first-adoption steps. | State default startup migration and the explicit opt-out/immutable-CI branch before offering adoption steps. |

## Maintenance findings

| Finding | Classification / priority | Evidence | Affected guidance | Acceptance and action |
|---|---|---|---|---|
| F01 | Outdated / P1 | E01, E03 | Body pairing paragraph and decision flow; `rspack-2-upgrade.md` | Route existing Rspack 1 upgrades directly; show release update then normal startup with automatic dependencies enabled. Preserve opt-out, manual preparation, workspace ownership, and frozen CI. Add both default and opt-out cases. |
| F02 | Partial / P2 | E02-E05 | Migration references omit third-party compiler compatibility | Inventory actual loader/compiler/plugin versions. Add conditional Svelte/TypeScript and Lingui examples; distinguish the SWC host in Rspack from a separately installed `@swc/core`. Test minimal fixes, independent package majors and older-release near misses. |
| F03 | Partial / P2 | E02, E04 | Existing upstream configuration checklist omits runtime, ESM, dev-server and resolution boundaries | Explain which upstream changes affect app overrides versus Meteor defaults. Keep valid CommonJS config and Meteor-provided roots; review custom resolution and dev-server options. Add a plausible upstream-advice near miss. |
| F04 | Partial / P2 | E01, E03 | Troubleshooting feedback and validation matrix | Record a reduced reproduction and resolved toolchain, separate compilation/startup from actual UI and production behavior, and leave ownership open until isolated. Add beta-feedback and capability-parity cases. |

## Skill claim matrix

| Skill | Distributable file and section | Claim and context | Evidence / status | Evaluation coverage |
|---|---|---|---|---|
| `migrate-to-rspack` | `SKILL.md`, description, pairing and decision flow | Existing Rspack 1-to-2 upgrade versus first activation; required npm preparation | E01/E03, F01 | Existing 6, 23, 25; add default startup and beta opt-out |
| `migrate-to-rspack` | `references/rspack-2-upgrade.md`, coordinated dependencies | Exact beta pairing, npm transition flag, authoritative workspace lockfile | E01/E03, covered; retain these branches while clarifying automatic startup | 23-25 |
| `migrate-to-rspack` | Same reference, app-owned overrides | CSS/cache/output/SWC configuration boundaries; missing ESM/dev-server/resolution branch | E02/E04, existing claims covered, F03 incomplete | 24; add custom configuration near miss |
| `migrate-to-rspack` | `references/framework-and-css.md`, framework capability inventory | Loader parity for first activation does not address already-enabled third-party compiler upgrades | E03/E05, F02 | 17; add Svelte, Lingui and earlier-release cases |
| `migrate-to-rspack` | `references/troubleshooting.md`, reporting; `references/validation-matrix.md` | Generic reporting and custom-loader checks do not preserve enough beta migration evidence | E01/E03, F04 | 13, 19, 26; add feedback and translated-output checks |
| `migrate-to-rspack` | `references/client-graph-preflight.md`, `code-migrations.md` | Graph boundaries, generated inputs, interop, existing service workers | E02/E03, no new conflicting behavior; retain baseline claims | 9-12, 18, 26 |
| `meteor-modern-build-stack` | `SKILL.md`, setup/configuration scope and migration handoff | New-app setup and integration API remain distinct from existing-app migration | E01/E02, covered; no classification or ownership change | Prior audit's modern-build 18, 19, 22-25 |

## Evaluation gaps

The current migration cases stop at 26. None directly exercises default
startup without a separate npm update, a Svelte preprocessor TypeScript
configuration failure, a Lingui plugin/runtime mismatch, or copying raw
Rspack ESM/resolution advice into Meteor. Existing generic loader and
production-browser cases are still needed as regression checks.

## Uncertain findings

None proposed for implementation. Do not infer compatibility with all future
Svelte/Lingui versions, or claim the five examples passed unreported modes.
Those require resolved package versions and fresh runtime evidence.

## No-action findings

- The examples require no new published skill: `migrate-to-rspack` owns the
  complete outcome. Preserve its name, classification, bundles and Meteor range.
- The PR does not replace its Rspack configurations. Meteor keeps an existing
  config file and composes integration defaults; automatic migration is not a
  promise to rewrite every app-owned option or upgrade every third-party tool.
- The Svelte change adds TypeScript configuration and updates Svelte, not
  Skeleton, `svelte-loader` or `svelte-preprocess`. Notes Offline changes the
  SWC plugin without upgrading its whole Lingui toolchain to the same major.
- Offline-data semantics, React Compiler and general workspace support remain
  covered by the previous audit. Five reported startups do not prove them.

## Recommended next actions

1. Correct F01 in the existing migration entry point and beta reference.
2. Add F02/F03 as conditional migration guidance, with exact examples and
   upstream links rather than universal dependency pins or config rewrites.
3. Add F04's evidence checklist and smallest affected acceptance cases.
4. Run fresh behavior cases, repository checks and ZIP inspection; record
   implementation and limitations separately in the release review handoff.

## Maintenance handoff

The user explicitly requested Rspack 2 migration updates using `release-3.6`,
official documentation and examples PR #50. Implement confirmed F01-F04 in
`migrate-to-rspack` on `release/v1.1.0-beta.0`, preserving its classification
and older-version behavior. Acceptance must cover both automatic and explicit
dependency preparation, app-owned tooling, Meteor/upstream boundaries and
honest validation reporting. Keep this pre-edit report immutable after commit.
No new skill, example/Meteor source edit, remote message, push, tag or release
publication is authorized by this follow-up.
