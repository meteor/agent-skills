# Evaluation contract

The evaluation layer has four distinct surfaces:

| Path | Purpose | Published in skill ZIPs |
|---|---|---|
| `skills/<name>/references/eval-cases.md` | Complete canonical manual cases | Yes |
| `evaluations/skills/<name>/cases.json` | Representative machine-readable subset | No |
| `evaluations/fixtures/` | Small starting workspaces for file-based cases | No |
| `evaluations/snapshots/` | Content-addressed suites used by committed reports | No |
| `evaluations/reports/` | Reproducible evidence from completed runs | No |
| `evaluations/.work/` | Generated workspaces, transcripts, and command output | No, ignored |

## Case design

Each suite covers the skill's central outcome and at least one boundary or failure mode. Prefer four to eight high-signal cases over duplicating the complete manual inventory.

Every case contains:

- a stable kebab-case ID;
- an exact `case_ref` to a canonical heading;
- a prompt that does not disclose the answer;
- an explicit Meteor release and relevant package versions;
- two to eight independently gradeable assertions;
- tags that explain why the case is representative, a boundary, a failure, a regression, or version-sensitive;
- a committed fixture when file changes or commands are the intended evidence.

An assertion states one observable outcome. Use `response` for decisions and explanations, `files` for repository state, and `command` for deterministic verification. A command assertion declares the exact read-only or test command in its `command` field.

## Routing design

Routing cases test descriptions before skill bodies are loaded. Each prompt names:

- one expected primary skill;
- zero or more allowed secondary skills;
- zero or more forbidden near-neighbor skills;
- the handoff or boundary behavior that distinguishes the route.

Add a routing case when a new skill is introduced or a description changes ownership. Include positive prompts, overlapping prompts where a secondary skill is useful, and near misses where a neighboring skill must stay out.

## Comparison integrity

A valid matched comparison keeps these inputs equal:

| Fixed input | Verification |
|---|---|
| Prompt and assertion set | Same suite case and suite digest |
| Starting workspace | Same fixture SHA-256 for each case and repetition |
| Meteor context | Same release and package versions |
| Agent environment | Same client, model, platform, and accessible project files |
| Repetition index | Pair conditions within the same case and repetition |

Change only the skill condition. If a run crashes or the harness leaks expected answers, record `error`, classify the harness gap, and exclude the run from capability claims.

Before executing, preserve the exact suite used by the run:

```bash
pnpm run evaluation:snapshot-suite -- evaluations/skills/<skill>/cases.json
```

The command writes a content-addressed copy under `evaluations/snapshots/`. Commit that snapshot with the report. Later suite maintenance does not invalidate or rewrite historical evidence.

Compute a workspace digest with:

```bash
pnpm run evaluation:hash-fixture -- evaluations/fixtures/<skill>/<case>
```

The helper hashes a versioned header, sorted relative file paths, byte lengths, and file contents. It rejects symbolic links. Advisory cases use its canonical empty-workspace digest. The report validator recomputes committed workspace fixtures, so a run cannot claim a different starting tree.

## Report rules

Reports use `evaluations/schemas/evaluation-report.schema.json`. The validator checks:

- dated filenames;
- an immutable suite snapshot and its exact digest;
- complete, identical assertion IDs for every run;
- matched `current-skill` and `without-skill` conditions for comparisons;
- identical fixture digests inside a comparison pair;
- an exact previous revision when `previous-skill` is used;
- at least three repetitions per condition for reliability, time, or token claims.

Reports are immutable evidence. When a suite, skill, model, or Meteor revision changes, create a new report instead of editing an earlier result.
