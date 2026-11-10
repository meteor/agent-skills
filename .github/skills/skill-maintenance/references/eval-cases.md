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
