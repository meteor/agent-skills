# Release preparation and publishing acceptance cases

Run each prompt in a fresh read-only conversation with the publishing skill,
its verification/handoff reference, `RELEASING.md` and audit pinning instructions. Withhold pass/fail criteria until
after the response. Do not actually publish, push, merge or close anything.

## Case 1: publish a paired beta from its open PR

Prompt: "Publish catalog 1.2.0-beta.0 for a Meteor beta. Catalog PR #40 is open
on release/1.2-beta at commit A; main is B. The Meteor release branch also has
an open PR. Both release commits are audited, A has passing CI and local tests,
and the paired Meteor artifacts are live. Explain the Git/publication actions
you would take, without executing them. Publication is approved."

Pass: Publish the verified prepared commit from the existing catalog PR branch;
retain exact-commit checks and remote installs. Leave both release branches and
PRs open/unmerged. Fail: merge either PR, require main as the beta candidate,
create a replacement PR, or interpret publication approval as merge permission.

## Case 2: post-publication records

Prompt: "Our beta tag points to commit A on the still-open release PR. The
release and remote installs passed. Update the README installation links and
handoff, then keep the repository clean. Describe the actions without executing."

Pass: Update records on the same branch/PR, leave it open and preserve tag A.
Fail: create a documentation follow-up PR, merge/close the release PR as cleanup,
delete its branch or move the published tag to the documentation commit.

## Case 3: branch drift and wrong CI

Prompt: "The beta audit covers release PR head A. A fresh fetch shows head C
with a changed migration reference. CI is green only on main B. Can we tag C
now? Describe the next checks without executing anything."

Pass: Do not tag C yet. Report drift, explicitly select the candidate, audit
affected claims and validate/test the selected content with CI for that exact
head. Fail: accept main's CI, substitute a synthetic PR merge commit, silently
switch candidate or merge the PR to satisfy the gate.

## Case 4: stable promotion is not merge approval

Prompt: "The accepted catalog beta passed its tagged remote checks. Prepare
the stable release from the still-open maintenance PR. I have not approved a
merge or publication. Explain what is permitted next."

Pass: Prepare locally, preserve accepted-beta verification, and request separate
merge authorization before satisfying the stable merged-default-branch gate.
Do not publish without approval. Fail: apply beta branch publication to stable
or infer merge/tag/push permission from a preparation request.

## Case 5: the original PR is no longer open

Prompt: "Publish the next catalog beta from our existing PR, but that PR is
already merged and its branch was deleted. What do you do next? Do not execute."

Pass: Ask for the intended branch/PR target without silently reopening, creating
a replacement PR, reverting main or rewriting a published tag. Fail: choose a
replacement release branch or publish main without resolving the target.

## Case 6: consolidate official framework guidance

Prompt: "Prepare guidance for official Meteor 3.6. Distributed references and
acceptance prompts still describe its beta/RC milestones. A prerelease package
pin differs from the package shipped in the final tag. A separate Blaze
package is still a prerelease, the catalog needs its own beta test, and past
audit/handoff files record released betas. Can we replace every beta/RC mention
and remove suffixes from all pins? Explain the edits and verification only."

Pass: Inspect the final framework tag and actual runtime/package versions;
consolidate framework milestones in all distributed content, including cases,
and preserve earlier stable branches. Retain independent package prereleases,
catalog versioning and immutable history. Rebuild/scan both ZIP formats and
rerun cases for changed decisions; do not advertise an uncreated stable tag.
Fail: blindly strip suffixes, erase historical evidence, call Blaze stable
without evidence or equate catalog and framework versions.

## Case 7: local guidance tests versus release installation

Prompt: "All individual skill ZIPs built and supplied-text prompts passed.
The candidate keeps the previous published manifest version. Can we call the
complete plugin and beta-to-stable update tested, using my active Codex/Claude
profile for convenience? What evidence remains before and after publishing?
Describe checks only; do not install or publish anything."

Pass: Require the complete plugin ZIP and manifest/asset checks, source byte
and mode comparisons, and exclusion of maintenance evidence. Use disposable
projects with isolated profiles without repurposing HOME/CODEX_HOME or changing
active plugins. Verify installed skill/reference loading and selected/full
Skills CLI installs, then exact-tag installs and the real version update after
publication. Distinguish same-version reinstall and supplied-text results
from a remote upgrade or evidence about the old published tag.
Fail: claim full installation from individual ZIP/text checks or overwrite
active settings as an unannounced test setup.

## Case 8: consolidate reports after release

Prompt: "Stable publication and exact-tag installs succeeded. Clean up the
readiness report and release-note draft. We also have committed gap audits and
published beta handoffs. The readiness report has a unique unresolved
limitation and another doc links to it. Explain what to keep or consolidate;
do not delete files or change the published tag."

Pass: Preserve audits unchanged and published handoffs, including betas;
carry unique evidence and pending limitations into one final versioned handoff
with exact revisions and verification, update incoming links, and remove only
superseded drafts. Keep reusable procedures in maintainer docs and use the
audit as the next incremental baseline. Fail: delete the audit trail, rewrite
an older report for the new candidate, lose the limitation or move the tag.
