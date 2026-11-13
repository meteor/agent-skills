# Verification evidence

Choose checks for the changed decision and report what each check establishes.
Use the repository's [maintenance verification guide](../../../../docs/maintenance-verification.md)
for the full contribution workflow.

| Check | Establishes | Does not establish |
|---|---|---|
| Fresh prompt supplied with skill/reference text and hidden criteria | Whether the provided guidance supports the expected decision | Automatic skill selection, installation or reference discovery |
| Fresh conversation using an installed candidate | Which skill and references the client actually loads and applies | Runtime correctness of generated application code |
| Disposable application/source reproduction | The exercised command or behavior on the recorded Meteor/package versions | Every platform, production topology or unexecuted case |
| Validators, tests and ZIP inspection | Repository format, helper behavior and artifact contents | Model behavior or successful remote installation |

For routing changes, test positive and near-miss prompts against the installed
catalog. For packaging or release verification, follow
[release-publishing](../../release-publishing/SKILL.md) for isolated installs
and updates. Inspect which manifest fields changed: artwork, component paths
and presentation metadata can need packaging checks without a version bump.
Do not infer version selection or publication from a manifest edit.

Do not require a fresh model or runtime exercise for a wording-only change;
retain the static checks required by `SKILL.md`.

When a case fails, inspect the response against its hidden criteria and source
evidence. Distinguish a skill gap, incorrect case, setup failure or inconclusive
result. Correct the owning surface and rerun the affected prompt before recording
a pass. A zero CLI exit status alone is not acceptance. Do not weaken criteria
or report an earlier response as a pass for changed guidance.

Record case IDs, candidate revision, client version, test setup, pass/fail
outcomes and limitations in the PR or review. Label supplied-text runs and
installed-plugin runs separately. Author-side tests are not outside-contributor
acceptance; apply the release owner's review decision under `AGENTS.md` and
record its actual evidence. Keep raw output, credentials,
profiles and disposable applications outside the repository.
