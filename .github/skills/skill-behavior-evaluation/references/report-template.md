# Evaluation report template

Copy this structure to `evaluations/reports/YYYY-MM-DD-<skill>-<client>.json` after completing real runs. Replace every example value. `suite_sha256` is the SHA-256 of the exact suite file used for every run.

```json
{
  "schema_version": 1,
  "created_at": "2026-08-25T12:00:00.000Z",
  "mode": "comparison",
  "suite": "evaluations/skills/meteor-example/cases.json",
  "suite_snapshot": "evaluations/snapshots/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.json",
  "suite_sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "skill_version": "0.2.0",
  "agent_skills": {
    "revision": "0123456789abcdef",
    "dirty": false
  },
  "meteor": {
    "remote": "https://github.com/meteor/meteor.git",
    "revision": "fedcba9876543210",
    "release": "3.5.2",
    "dirty": false
  },
  "environment": {
    "client": "client and version",
    "model": "model identifier",
    "platform": "operating system and runtime"
  },
  "claims": ["behavior"],
  "runs": [
    {
      "case_id": "representative-case",
      "repetition": 1,
      "condition": "current-skill",
      "fixture_sha256": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      "status": "pass",
      "assertions": [
        {
          "id": "observable-outcome",
          "passed": true,
          "evidence": "File and line, response excerpt, or command result."
        },
        {
          "id": "boundary-preserved",
          "passed": true,
          "evidence": "Concrete evidence for the second assertion."
        }
      ],
      "artifacts": [
        "evaluations/.work/run-id/response.txt"
      ]
    }
  ],
  "summary": {
    "classification": "no-gap",
    "notes": "State what this run supports and what it did not test."
  }
}
```

Comparison reports add the matched `without-skill` run for every case and repetition. A maintenance comparison may also add `previous-skill` runs and:

```json
{
  "comparison": {
    "previous_skill_revision": "89abcdef01234567"
  }
}
```

Do not commit raw artifacts listed under `evaluations/.work/`. Their paths document local evidence locations; preserve externally only when the project's evidence policy requires it.
