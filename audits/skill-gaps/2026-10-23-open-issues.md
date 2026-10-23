# Open skill issues audit, 2026-10-23

## Run context

```text
Agent-skills target ref: main, verified against GitHub and fetched before implementation
Agent-skills revision: 82171fa0de11b9087416cb870470d04ddda4c323; clean at audit start
Meteor remote: https://github.com/meteor/meteor.git
Meteor revision: 4c94e92457c06cb73082a8d59908257bf6b518d1; immutable GitHub source snapshot of devel
Meteor comparison revision: 020cfbdf04e9d727ffff8bd7e1a1bc4fa5e73fa8; release/METEOR@3.5.1
Meteor release context: Meteor 3 application guidance; not a release-publishing audit
Audit mode: full review of open issues #8 through #13; not a full catalog or release-diff audit
Previous audit report: audits/skill-gaps/2026-10-07-meteor-3.6-rc.0-cumulative.md, committed in 68b70aa
Previous Meteor revision: cc8cf7d21d24da5f4a4fd456527225bc5ce0e721; contextual baseline only
Blaze stable revision: e700f2d749ed037afae14dc3f055b9e52d5de375; master, blaze 3.0.3
Blaze prerelease revision: 068f0c09f4851bdc150e2e30f1a09bae3700914b; release-3.1.0, blaze 3.1.0-beta.0
```

The available local Meteor checkout is a modified Meteor 2 tree and was not
used as Meteor 3 evidence. Review used pinned upstream files. No claim of a
clean local Meteor 3 checkout or complete application reproduction is made.
The six open issue bodies had no comments at audit time. All six findings
were reported to the user before implementation was authorized.

## Source coverage

| Evidence | Pinned source and relevant behavior |
|---|---|
| E01 | [Meteor scaffold tests](https://github.com/meteor/meteor/blob/4c94e92457c06cb73082a8d59908257bf6b518d1/tools/static-assets/skel-blaze/tests/main.js), scaffold package manifests, and [node-stub map](https://github.com/meteor/meteor/blob/4c94e92457c06cb73082a8d59908257bf6b518d1/npm-packages/meteor-node-stubs/map.json). The scaffold uses `assert`; the published npm `assert@2.1.0` archive has no `strict` subpath. |
| E02 | [Blaze bindings](https://github.com/meteor/blaze/blob/e700f2d749ed037afae14dc3f055b9e52d5de375/packages/blaze/builtins.js), `materializer.js`, `view.js` and `domrange.js`. Persistent bindings share a reactive variable; direct Promise content gets an `_Await` View destroyed on replacement. The beta retains this distinction. |
| E03 | [Client queue](https://github.com/meteor/meteor/blob/4c94e92457c06cb73082a8d59908257bf6b518d1/packages/ddp-client/client/queue_stub_helpers.js), also checked at the Meteor 3.5.1 revision. `queueFunction` attaches a no-op rejection handler without changing the returned Promise's rejection. |
| E04 | [Blaze prerelease history](https://github.com/meteor/blaze/blob/068f0c09f4851bdc150e2e30f1a09bae3700914b/HISTORY.md), both versions' `dombackend.js` and package manifests. Native mode starts in `3.1.0-alpha.0`; `3.1.0-beta.0` includes the fix from PR 513 and changes the no-jQuery `instance.$()` return type. |
| E05 | Both Blaze versions' `lookup.js`, `template.js`, `dombackend.js` and `spacebars/spacebars-runtime.js`; [jQuery 3.7.1 event implementation](https://github.com/jquery/jquery/blob/3.7.1/src/event.js). Helper precedence, synchronous template-instance scope, and native event access through `originalEvent` are separate concerns. |
| E06 | Both Blaze versions' `spacebars-compiler/templatetag.js`, `html-tools/parse.js` and `templating-tools/compile-tags-with-spacebars.js`; [Meteor error page](https://github.com/meteor/meteor/blob/4c94e92457c06cb73082a8d59908257bf6b518d1/tools/runners/run-proxy.js). The four compiler errors are explicit; the development error page renders the tool log. |

Meteor public documentation reviewed at E01/E03's revision includes
`v3-docs/v3-migration-docs/front-end/blaze.md`,
`v3-docs/docs/tutorials/blaze/1.creating-the-app.md` and
`v3-docs/docs/api/meteor.md`. Implementation establishes details that the docs
do not specify. Package release history, not a Meteor version, establishes
the native Blaze backend boundary.

## Skill claim matrix

| Finding | Classification / priority | Affected claim | Evidence | Existing acceptance and required change |
|---|---|---|---|---|
| [8](https://github.com/meteor/agent-skills/issues/8) | Outdated / P1 | `meteor-testing` method example and `meteor-blaze` programmatic client test import `node:assert/strict` into potentially browser-bound modules. | E01 | Testing cases 1-3 and Blaze case 12 miss import compatibility. Use `assert` plus explicit strict assertions; add a shared-entry failure and a server-only near miss. |
| [9](https://github.com/meteor/agent-skills/issues/9) | Outdated / P2 | `meteor-blaze` body/reference overgeneralize latest-resolved behavior to all Promise rendering. | E02 | Case 5 correctly exercises `#let`. Narrow its explanation and add a direct-mustache comparison; retain protection for application-owned state. |
| [10](https://github.com/meteor/agent-skills/issues/10) | Partial / P1 | `meteor-methods` lacks a silent-rejection diagnostic; migration already catches fire-and-forget errors without explaining why. | E03 | Methods case 8 covers error shape, not ignored calls. Add a failed-save case and a migration ownership case. Do not claim all errors on every runtime are silent. |
| [11](https://github.com/meteor/agent-skills/issues/11) | Partial / P2 | `meteor-blaze` omits the scaffold's jQuery dependencies and package-specific removal boundary. | E04 | Case 1 checks scaffold inspection but no backend boundary. Add 3.0.3, alpha and beta decisions; verify other jQuery consumers and actual events. |
| [12](https://github.com/meteor/agent-skills/issues/12) | Partial / P2 | `meteor-blaze` lacks helper/inclusion collision, post-await instance scope and wrapped-event diagnostics. | E05 | Cases 3 and 8 cover neighboring Tracker/data-context concerns. Add one focused case for each distinct trap. |
| [13](https://github.com/meteor/agent-skills/issues/13) | Partial / P2 | `meteor-blaze` and `meteor-debugging` lack compiler error signatures and the development error-page distinction. | E06 | Add compiler-positive, valid-syntax near-miss and debugging-handoff cases. Use compact triggers within the existing ownership boundary. |

## Corrections to issue proposals

- Issue 8 needs explicit `strictEqual` and `deepStrictEqual` after changing the
  import. Do not prohibit `node:assert/strict` in isolated server modules.
- Issue 9 does not justify a blanket claim that direct helpers cannot race:
  helper side effects and externally stored state still need ownership.
- Issue 11's alpha-only release context is stale. PR 513 merged on September
  14, and the September 23 beta history records it. Do not require a Meteor
  upgrade solely to select an independently released Blaze package, or treat
  missing console messages alone as proof of a working native backend.
- Issue 13's quoted built-in block attribute and literal `import` text are
  valid. They must not be classified as the reported compiler failures.

## Audit verification and limitations

Isolated compiler checks against both Blaze snapshots reproduced all four
reported failures and compiled the fixed checkbox, escaped attribute, closed
list, quoted built-in block and literal import examples. Source-function
probes confirmed the client queue rejection behavior at both Meteor revisions
and loss of template-instance scope after `await` at both Blaze revisions.
Backend initialization probes used a minimal DOM stub; they are not browser
or application smoke tests. Assertion archive inspection and source review
support the import finding without claiming a complete Rspack app test.

Fresh agent evaluations, repository checks and ZIP inspection belong to the
implementation verification and must be reported separately in the PR.
Outside-contributor Claude Code/Cursor review is still required by AGENTS.md
for description/routing changes. No uncertain finding or new skill is proposed.

## Maintenance handoff

After reviewing the audit, the user authorized a branch from latest `main`
and a PR addressing all six issues, with closure later through merging.
Implement findings 8-13 only in the five existing skill owners and their cases.
Preserve names, classifications, bundles and minimum Meteor ranges. Keep this
audit outside release ZIPs. Commit and push the focused change, link all six
issues with closing keywords, and leave merging and release publication out
of scope. Preserve this audit as pre-implementation evidence; record final
verification and remaining external review in the PR.
