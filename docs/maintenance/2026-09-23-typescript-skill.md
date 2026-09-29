# TypeScript skill completion review

Implements the user-authorized T01 finding in the
[scope follow-up](../../audits/skill-gaps/2026-09-23-typescript-scope.md).
The seven original beta.1 findings remain implemented as recorded in the
[earlier maintenance review](2026-09-23-meteor-3.6-beta.1.md).

## Scope and evidence

The baseline is Agent Skills `0b6eb729fd41cb96e91cf21401de61e4c7e6b363`.
Meteor remains pinned to official `release/METEOR@3.6-beta.1`,
`82ea8df295134e64f495338a2e63362408098a24`. The tagged TypeScript guide,
generator/CLI implementation, template compatibility tests and prior runtime
evidence support the new skill. Later release-branch changes stay excluded.

`meteor-typescript` owns application declaration providers, native opt-in,
TypeScript/JavaScript configuration, editor resolution and checking. Its
classification is knowledge/build with Meteor >=3.0: native generation is
gated at beta.1, while earlier releases retain the legacy provider branch.
It has no bundle membership because the complete language workflow is optional
for each existing bundle audience. Existing skill classifications are unchanged.

Detailed provider instructions moved from the runtime-migration reference to
the new skill. Migration retains provider preservation, checkpoints, failure
recovery and a handoff. Modern build retains transpilation/checker integration;
Rspack migration preserves working providers and hands off explicit adoption.
The catalog now contains 17 published skills.

The final source review found no remaining confirmed F01-F07 implementation
gap. T01 supplies the requested additional skill. Package authoring and shell
completion remain documented out-of-scope findings rather than unimplemented
skill proposals. No uncertain or post-beta.1 capability was added.

## Behavioral checks

Fresh Claude Code 2.1.252 conversations used current skill/reference content,
hidden acceptance criteria, disabled tools/settings/MCP and no persistence.
The response model reported `claude-opus-5[1m]`. These runs verify the named
decisions; they do not certify all unsolicited advice in each response.

| Cases | Final result |
|---|---|
| TypeScript 1-10, 13 | Pass: native adoption, provider preservation, generation failure, scoped imports, TS7, source inclusion, older release, JS IntelliSense, root config and uncovered package boundaries |
| TypeScript 11-12 | Pass after correction: build configuration and runtime migration hand off before inventing procedures |
| Migration 23, 29-30 | Pass with the declaration owner available: legacy support, runtime/provider sequencing and provider preservation |
| Modern build 31; Rspack migration 36 | Pass: exact pairing, separate checking and native dependency/provider boundaries |
| Migration 36; modern build 32 | Pass in description-only routing runs: standalone declarations select `meteor-typescript` |

The first TypeScript 11-12 answers acknowledged the boundary but then invented
generic Rspack configuration and a runtime-first migration sequence. The body
now requires consulting the owning skill before those steps. Fresh reruns
passed. Neighbor body-loading runs do not prove catalog selection; the two
explicit neighboring routing cases were therefore evaluated from descriptions.

Five additional description-only probes passed: native declaration adoption
and JS IntelliSense selected TypeScript; SWC/CSS configuration selected modern
build; async/Fibers migration selected runtime migration; Atmosphere publishing
selected no application skill and referred to official documentation.

Earlier migration cases 31-32 and 34-35 moved to TypeScript cases 3-6.
Migration case 29 now tests the upgrade handoff. Historical audit results
refer to their original committed case revisions.

## Executable verification

The existing disposable Meteor 3.6-beta.1 app retains the prior TypeScript
generation, TS7, source-inclusion and failure-recovery evidence. An additional
JS fixture, using that app's installed compiler and packages, verified:

1. Without root `tsconfig.json` or `jsconfig.json`, `meteor types` exited zero
   with “Nothing to do” and left the native barrel unchanged.
2. A root `jsconfig.json` enabled generation before native paths were selected.
3. A JS module importing `Random` with a JSDoc number annotation around
   `Random.id()` failed `tsc --project jsconfig.json --allowJs --checkJs --noEmit`
   with TS2322.
4. Changing only that annotation to string passed; the original app config
   was restored and temporary probes removed.

This proves generation and optional JS checking, not a graphical editor's
hover UI. A fresh Claude plugin conversation loaded the installed JS reference
and correctly kept error checking optional for an IntelliSense-only request.

## Repository and installation checks

Validation, links, catalog checks, 33 tests, dependency audit and ZIP generation
passed during implementation. Both strict Claude manifest checks and the
current Codex plugin-creator validator passed. Final exact-commit checks and
archive/install byte comparisons belong in the release handoff.

The complete plugin installed as `1.1.0-beta.1` in disposable Codex 0.155.1
and Claude Code 2.1.252 profiles. The new skill also installed individually
with the Skills CLI. User plugin settings remained untouched. Fresh plugin
conversation results and any installation limitations are recorded in the
release handoff. Temporary apps, credentials mounts and raw transcripts are
outside the repository.

All requested beta.1 content and the approved TypeScript suggestion are now
implemented. Outside-contributor acceptance remains pending under `AGENTS.md`;
these agent-run evaluations are not an outside review.
