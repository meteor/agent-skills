# Skill maintenance acceptance cases

Run these prompts in fresh read-only conversations with the maintenance
skill, verification evidence reference and repository contract. Hide the
criteria until each response finishes. Do not modify an app or repository.

## Case 1: supplied context does not prove installed discovery

Prompt: "A routing change passed when we pasted the skill and references into
a fresh conversation. Both plugin manifests changed their artwork paths;
versions are unchanged. Can we record installed discovery and runtime behavior
as passing? Which checks and evidence
are needed? Describe the work without running it."

Pass: Label the supplied-text run as a guidance check. Require positive and
near-miss installed selection/reference checks for routing, both archive
builds/inspection and isolated plugin installation checks for packaging.
Keep application runtime evidence and outside-contributor acceptance separate;
do not claim either from an author-side text run. Fail: equate CLI success,
manifest validation or supplied context with all those outcomes, or assume
artwork-path changes imply a version bump/publication decision.

## Case 2: failed behavior versus wording-only maintenance

Prompt: "A security guidance case exited zero, but its answer violated the
hidden criteria. Another skill only has a spelling fix. Can I mark both passed
and run every app/device test again? Explain the next checks without executing."

Pass: Read the failed answer against criteria/source, distinguish a guidance,
case or setup problem, correct the owning surface and rerun the affected case.
Do not weaken criteria or count exit zero as acceptance. Use static checks for
the spelling-only edit; avoid unrelated model/runtime tests. Record the setup,
candidate, client, case IDs and actual outcomes; keep raw output outside Git.
Fail: accept the failed response, relabel old output after edits, or require
unrelated full application/device suites merely for spelling.

## Case 3: patch detail versus useful guidance

Prompt: "We are updating skills for a security patch. Verified changes are a
Node patch bump, an internal resolver refactor with unchanged public behavior,
and production OAuth setup now rejecting client configuration. Existing
runtime guidance already reads the project's bundled version. Should we add
all three changes and their history to every related skill? Describe the
smallest useful update and where its reasoning belongs. Do not edit files."

Pass: Keep runtime inspection instead of duplicating patch lists; leave the
internal refactor in docs/audit notes. Update the owning OAuth decision with
verified compatibility and safe server configuration. Record the inclusion
and omission reasons briefly outside published guidance; run affected cases
and static checks. Fail: append a changelog to each skill, update all sync
dates by default, or omit needed security guidance because this is a patch.

## Case 4: simplification must preserve useful boundaries

Prompt: "A patch-update draft passed all cases but repeats release history.
Can we cut it in half by deleting package boundaries and older-version
fallbacks, then move required setup into a sibling skill? Users can install
skills separately. Explain what to simplify and how to verify it, without
editing files."

Pass: Consolidate repetition without a fixed reduction quota. Retain
decision-changing compatibility, fallbacks and required standalone setup;
place conditional detail in local references. Passing tests do not justify
every paragraph. Rerun affected cases after trimming guidance without
weakening their behavioral criteria; static checks suffice for wording alone.
Fail: treat all detail as necessary because tests passed, remove the boundaries,
or depend on an unavailable sibling to achieve the size target.
