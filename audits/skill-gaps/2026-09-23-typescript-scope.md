# TypeScript scope follow-up for Meteor 3.6-beta.1

## Run context

```text
Agent-skills target ref: release/v1.1.0-beta.0-installation, current HEAD
Agent-skills revision: 0b6eb729fd41cb96e91cf21401de61e4c7e6b363; release preparation has uncommitted manifest/changelog changes, distributable skills unchanged
Meteor remote: https://github.com/meteor/meteor.git
Meteor branch: release-3.6
Meteor revision: 82ea8df295134e64f495338a2e63362408098a24; exact tagged tree
Meteor release context: 3.6-beta.1, release/METEOR@3.6-beta.1
Audit mode: incremental, user-authorized scope expansion
Comparison: same Meteor revision; implemented catalog versus expanded TypeScript outcome
Previous audit report: audits/skill-gaps/2026-09-23-meteor-3.6-beta.1.md, committed in 0b6eb729fd41cb96e91cf21401de61e4c7e6b363
Previous Meteor revision: 82ea8df295134e64f495338a2e63362408098a24
```

The original request maintained existing skill definitions. After reviewing
that completed maintenance, the user explicitly requested `meteor-typescript`
and completion of beta.1 gaps and suggestions before publication. This report
preserves that additional scope without rewriting the earlier audit.

## Source coverage

The original E01-E07 evidence and seven fixes remain applicable. The additional
scope uses tagged `v3-docs/docs/cli/using-core-types.md` (provider selection,
TypeScript and JavaScript apps, generation, resolution, checking and recovery),
`docs/packages/typescript.md`, `v3-migration-docs/typescript/meteor-types.md`,
`tools/cli/commands.js`, `tools/isobuild/types-generator.js`, and the native
generation/template compatibility tests. The prior disposable beta.1 app
verified compiler compatibility, source inclusion and rollback.

## Summary

| Classification | Count |
|---|---:|
| Covered | 7 |
| Candidate | 1 |
| Uncertain | 0 |

## Maintenance findings

| Finding | Classification / priority | Outcome and evidence | Required change and acceptance |
|---|---|---|---|
| T01 | Candidate / P2 | Meteor app declarations, editor resolution and type-checking recur without a framework upgrade. Tagged docs explicitly cover new apps, existing apps and JavaScript IntelliSense. Migration cannot own all those requests; bundling and type-checking are separate layers. | Add `meteor-typescript`; transfer detailed provider guidance from migration, retain migration checkpoints and build ownership. Evaluate native success/skip/failure, older providers, TS7, source inclusion, JS IntelliSense, missing metadata and neighboring requests. |
| F01-F07 | Covered | Current skill changes implement the original audit; the maintenance review records passing affected cases and executable TypeScript checks. | Retain these fixes and rerun affected handoff cases when extracting TypeScript guidance. No additional Accounts, Node, instrumentation, Rspack or DDP implementation gap found in this follow-up. |

## Skill claim matrix

| Owner | Current claim and scope | Follow-up |
|---|---|---|
| `migrate-to-meteor-3` | Runtime migration plus detailed provider setup; standalone type triggers can attract ordinary-development requests | Retain upgrade sequencing, preservation and recovery checkpoint; route detailed declaration work to the new owner |
| `meteor-modern-build-stack` | SWC/Rspack configuration and separate type-checker boundary | Keep compiler/checker integration; name the declaration owner |
| `migrate-to-rspack` | Preserve providers during bundler migration | Keep scope; hand off explicit provider adoption |
| Proposed `meteor-typescript` | Meteor app declarations across development and upgrades | Knowledge/build, Meteor >=3.0 with native beta.1 floor and earlier legacy branch; no bundle because this optional language workflow is not needed by every existing bundle audience |
| Other thirteen existing skills | Original beta.1 affected claims and unchanged owners | Original matrix remains applicable; no new routing or classification changes |

## Proposed skill candidate

`meteor-typescript` has a repeatable application outcome, source-backed
decisions that prevent broken provider switches and false-positive checks,
distinct routing and executable acceptance. Cover declaration providers,
`tsconfig`/`jsconfig`, editor module resolution and local/CI checking. Keep
general TypeScript language teaching and Atmosphere declaration publication
outside its scope. Link the package-author documentation when that is the
actual task instead of expanding this application skill.

## Evaluation gaps

Transfer the existing detailed native-provider cases to the new owner. Add
new-app, JavaScript IntelliSense, missing-root-config and missing-package-type
cases. Verify routing against Meteor 2 migration, Rspack setup and package
authoring. Existing runtime/Accounts cases retain their previous evidence.

## Release blockers and no-action findings

Complete T01 and affected verification before the requested beta publication.
The original report's post-beta.1 exclusions remain unchanged. No separate
package-author or general CLI skill is justified by this follow-up. Outside
contributor acceptance remains a release review requirement; agent-run cases
do not establish that acceptance.

## Maintenance handoff

The user explicitly authorized T01 with “please add it then” and requested
completion before publication. Apply `skill-maintenance` and `skill-creator`,
preserve existing classifications, update neighboring handoffs and evaluation
ownership, regenerate the catalog and verify all distributable archives. Keep
this pre-edit report immutable and record implementation results separately.
