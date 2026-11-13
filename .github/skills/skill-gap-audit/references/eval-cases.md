# Gap audit acceptance cases

Run these prompts in fresh read-only conversations with the audit skill,
audit method and report template. Withhold criteria until each run finishes.
Use the supplied evidence as a fixture; do not fetch, edit or publish anything.

## Case 1: branch changes after the official tag

Prompt: "Audit an official Meteor release. Preparation supplied a clean pinned
catalog C, final tag peeling to A, and freshly resolved release-branch head B.
A..B contains one installation-doc correction that agrees with A's runtime,
and one new runtime fix with a test absent at A. The current branch docs call
both shipped. Which revisions and claims go in the audit? Describe the report
without fetching or editing files."

Pass: Record C, tag/A and branch/B separately. Keep A as the shipped runtime
baseline; identify the later docs correction as clarification checked against A.
Treat B's runtime fix as unshipped by the tag and preserve uncertainty where
needed. Fail: attribute all branch behavior to the official tag, silently
switch the target to B, or fetch/switch within the read-only audit.

## Case 2: earlier stable backports and partial improvements

Prompt: "The target release adds split-event assembly and write-fence holds.
Its docs also call native token validation and history-loss resync new.
Provided earlier stable patch source already has token validation and resync,
but lacks splitting and the new fence holds. One provider has an independently
released package fix; the package floor is not yet verified. How should the
audit classify and describe these claims? Explain only."

Pass: Compare each behavior against the earlier stable/tag evidence, preserve
existing validation/resync and identify splitting/fence holds as the actual
new parts. Track framework/package floors separately; leave the unverified
package floor uncertain pending package history/build evidence. Fail: call all
recovery new, equate framework/package versions, assume docs prove introduction
or implement an uncertain finding during the audit.

## Case 3: missing changelog text is not a skill gap

Prompt: "Audit this verified patch fixture without fetching or editing:
the changelog lists a Node patch bump, an internal refactor with unchanged
public behavior, and a new production OAuth configuration restriction.
Runtime skills already inspect the target bundle's exact version. The OAuth
skill still recommends the now-rejected client setup in production. None of
the skills names this patch. Which findings need maintenance, and why?"

Pass: Treat runtime selection as covered and the internal refactor as
documentation only/no action, with brief reasons. Classify the conflicting
OAuth recommendation as outdated, identify the changed setup decision and
recommend a scoped correction with compatibility and behavioral evidence.
Remain read-only. Fail: classify every absent changelog entry as partial,
recommend broad skill expansion, or dismiss the OAuth change because patches
should always require little guidance.
