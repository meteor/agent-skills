import { createHash } from "node:crypto";
import { describe, expect, it } from "@rstest/core";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateEvaluations } from "../scripts/validate-evaluations.mjs";
import { hashEvaluationFixture } from "../scripts/hash-evaluation-fixture.mjs";
import { snapshotEvaluationSuite } from "../scripts/snapshot-evaluation-suite.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function validSuite() {
  return {
    schema_version: 1,
    skill: "meteor-example",
    description: "A representative evaluation suite used by validator tests.",
    cases: [
      {
        id: "workspace-case",
        case_ref: "Case 1: workspace behavior",
        mode: "workspace",
        prompt: "Update the example workspace and preserve its observable behavior.",
        meteor: { release: "3.0+" },
        fixture: "meteor-example/workspace-case",
        assertions: [
          {
            id: "changes-file",
            text: "The expected source file contains the requested change.",
            evidence: "files",
          },
          {
            id: "keeps-boundary",
            text: "The implementation preserves the documented boundary.",
            evidence: "response",
          },
        ],
        tags: ["representative"],
      },
      {
        id: "boundary-case",
        case_ref: "Case 2: version boundary",
        mode: "advisory",
        prompt: "Explain the compatible behavior on both sides of the version boundary.",
        meteor: { release: "3.4.1" },
        assertions: [
          {
            id: "states-floor",
            text: "The response states the supported version floor.",
            evidence: "response",
          },
          {
            id: "gives-fallback",
            text: "The response gives a compatible earlier-version fallback.",
            evidence: "response",
          },
        ],
        tags: ["boundary", "version"],
      },
    ],
  };
}

function validRouting() {
  return {
    schema_version: 1,
    description: "Routing fixtures for evaluation validator unit tests.",
    cases: Array.from({ length: 4 }, (_, index) => ({
      id: `route-${index + 1}`,
      prompt: `Route example Meteor request number ${index + 1} to its owning skill.`,
      expected: {
        primary: "meteor-example",
        secondary: [],
        forbidden: [],
        behavior: "Select the only published skill in this isolated test catalog.",
      },
    })),
  };
}

function seedRepo(root) {
  const evaluationsRoot = join(root, "evaluations");
  const skillsRoot = join(root, "skills");
  cpSync(join(repoRoot, "evaluations", "schemas"), join(evaluationsRoot, "schemas"), {
    recursive: true,
  });
  const skillRoot = join(skillsRoot, "meteor-example");
  mkdirSync(join(skillRoot, "references"), { recursive: true });
  writeFileSync(
    join(skillRoot, "SKILL.md"),
    `---
name: meteor-example
description: Use when evaluating an example Meteor skill. Triggers on isolated validator tests.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: testing
  tagline: "Evaluate an isolated Meteor example skill."
---

# Example
`,
  );
  writeFileSync(
    join(skillRoot, "references", "eval-cases.md"),
    "# Cases\n\n## Case 1: workspace behavior\n\n## Case 2: version boundary\n",
  );
  mkdirSync(
    join(evaluationsRoot, "fixtures", "meteor-example", "workspace-case"),
    { recursive: true },
  );
  writeFileSync(
    join(
      evaluationsRoot,
      "fixtures",
      "meteor-example",
      "workspace-case",
      "example.js",
    ),
    "export const value = 1;\n",
  );
  writeJson(
    join(evaluationsRoot, "skills", "meteor-example", "cases.json"),
    validSuite(),
  );
  writeJson(join(evaluationsRoot, "routing", "cases.json"), validRouting());
  return { evaluationsRoot, skillsRoot };
}

async function withTempRepo(run) {
  const root = mkdtempSync(join(tmpdir(), "meteor-evaluations-"));
  try {
    return await run(root, seedRepo(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function findingsFor(paths, trackedFiles = []) {
  return validateEvaluations({
    root: paths.evaluationsRoot,
    skillsRoot: paths.skillsRoot,
    trackedFiles,
  });
}

function validReport(paths) {
  const suiteFile = join(
    paths.evaluationsRoot,
    "skills",
    "meteor-example",
    "cases.json",
  );
  const suiteDigest = createHash("sha256")
    .update(readFileSync(suiteFile))
    .digest("hex");
  const snapshot = join(
    paths.evaluationsRoot,
    "snapshots",
    `${suiteDigest}.json`,
  );
  mkdirSync(dirname(snapshot), { recursive: true });
  cpSync(suiteFile, snapshot);
  const fixtureDigest = hashEvaluationFixture(
    join(
      paths.evaluationsRoot,
      "fixtures",
      "meteor-example",
      "workspace-case",
    ),
  );
  const assertions = [
    { id: "changes-file", passed: true, evidence: "example.js changed" },
    { id: "keeps-boundary", passed: true, evidence: "response explains boundary" },
  ];
  return {
    schema_version: 1,
    created_at: "2026-08-25T12:00:00.000Z",
    mode: "comparison",
    suite: "evaluations/skills/meteor-example/cases.json",
    suite_snapshot: `evaluations/snapshots/${suiteDigest}.json`,
    suite_sha256: suiteDigest,
    skill_version: "0.1.0",
    agent_skills: { revision: "0123456789abcdef", dirty: false },
    meteor: {
      remote: "https://github.com/meteor/meteor.git",
      revision: "fedcba9876543210",
      release: "3.5.2",
      dirty: false,
    },
    environment: {
      client: "test client 1.0",
      model: "test model",
      platform: "test platform",
    },
    claims: ["behavior"],
    runs: [
      {
        case_id: "workspace-case",
        repetition: 1,
        condition: "current-skill",
        fixture_sha256: fixtureDigest,
        status: "pass",
        assertions,
      },
      {
        case_id: "workspace-case",
        repetition: 1,
        condition: "without-skill",
        fixture_sha256: fixtureDigest,
        status: "fail",
        assertions: assertions.map((assertion) => ({
          ...assertion,
          passed: false,
          evidence: "observable outcome missing",
        })),
      },
    ],
    summary: {
      classification: "no-gap",
      notes: "The matched comparison demonstrates the expected behavior difference.",
    },
  };
}

describe("validateEvaluations", () => {
  it("accepts the repository evaluation definitions", async () => {
    expect(await validateEvaluations()).toEqual([]);
  });

  it("accepts a valid isolated evaluation tree", async () => {
    await withTempRepo(async (_root, paths) => {
      expect(await findingsFor(paths)).toEqual([]);
    });
  });

  it("creates an idempotent content-addressed suite snapshot", async () => {
    await withTempRepo(async (_root, paths) => {
      const suiteFile = join(
        paths.evaluationsRoot,
        "skills",
        "meteor-example",
        "cases.json",
      );
      const options = {
        allowedSuitesRoot: join(paths.evaluationsRoot, "skills"),
        outputRoot: join(paths.evaluationsRoot, "snapshots"),
      };
      const first = snapshotEvaluationSuite(suiteFile, options);
      const second = snapshotEvaluationSuite(suiteFile, options);
      expect(first).toEqual(second);
      expect(readFileSync(first.target, "utf8")).toBe(
        readFileSync(suiteFile, "utf8"),
      );
      expect(first.target.endsWith(`${first.sha256}.json`)).toBe(true);
    });
  });

  it("rejects a case_ref that is not a canonical heading", async () => {
    await withTempRepo(async (_root, paths) => {
      const suite = validSuite();
      suite.cases[0].case_ref = "Case 99: invented behavior";
      writeJson(
        join(paths.evaluationsRoot, "skills", "meteor-example", "cases.json"),
        suite,
      );
      const findings = await findingsFor(paths);
      expect(findings.map((item) => item.code)).toContain("E_EVAL_CASE_REF");
    });
  });

  it("rejects duplicate case and assertion identifiers", async () => {
    await withTempRepo(async (_root, paths) => {
      const suite = validSuite();
      suite.cases[1].id = suite.cases[0].id;
      suite.cases[0].assertions[1].id = suite.cases[0].assertions[0].id;
      writeJson(
        join(paths.evaluationsRoot, "skills", "meteor-example", "cases.json"),
        suite,
      );
      const codes = (await findingsFor(paths)).map((item) => item.code);
      expect(codes).toContain("E_EVAL_DUPLICATE_CASE");
      expect(codes).toContain("E_EVAL_DUPLICATE_ASSERTION");
    });
  });

  it("rejects a missing workspace fixture", async () => {
    await withTempRepo(async (_root, paths) => {
      const suite = validSuite();
      suite.cases[0].fixture = "meteor-example/missing";
      writeJson(
        join(paths.evaluationsRoot, "skills", "meteor-example", "cases.json"),
        suite,
      );
      const findings = await findingsFor(paths);
      expect(findings.map((item) => item.code)).toContain("E_EVAL_FIXTURE");
    });
  });

  it("rejects unknown and overlapping routing skills", async () => {
    await withTempRepo(async (_root, paths) => {
      const routing = validRouting();
      routing.cases[0].expected.secondary = ["unknown-skill"];
      routing.cases[1].expected.forbidden = ["meteor-example"];
      writeJson(join(paths.evaluationsRoot, "routing", "cases.json"), routing);
      const codes = (await findingsFor(paths)).map((item) => item.code);
      expect(codes).toContain("E_EVAL_UNKNOWN_ROUTE_SKILL");
      expect(codes).toContain("E_EVAL_ROUTE_OVERLAP");
    });
  });

  it("accepts a reproducible matched comparison report", async () => {
    await withTempRepo(async (_root, paths) => {
      writeJson(
        join(paths.evaluationsRoot, "reports", "2026-08-25-meteor-example-test.json"),
        validReport(paths),
      );
      expect(await findingsFor(paths)).toEqual([]);
    });
  });

  it("keeps an immutable report valid after the current suite evolves", async () => {
    await withTempRepo(async (_root, paths) => {
      const report = validReport(paths);
      const suite = validSuite();
      suite.description =
        "A later representative suite revision with the same published owner.";
      writeJson(
        join(paths.evaluationsRoot, "skills", "meteor-example", "cases.json"),
        suite,
      );
      writeJson(
        join(paths.evaluationsRoot, "reports", "2026-08-25-meteor-example-test.json"),
        report,
      );
      expect(await findingsFor(paths)).toEqual([]);
    });
  });

  it("rejects mismatched report assertions and comparison fixtures", async () => {
    await withTempRepo(async (_root, paths) => {
      const report = validReport(paths);
      report.runs[0].assertions[1].id = "invented-assertion";
      report.runs[1].fixture_sha256 = "b".repeat(64);
      writeJson(
        join(paths.evaluationsRoot, "reports", "2026-08-25-meteor-example-test.json"),
        report,
      );
      const codes = (await findingsFor(paths)).map((item) => item.code);
      expect(codes).toContain("E_EVAL_REPORT_ASSERTIONS");
      expect(codes).toContain("E_EVAL_REPORT_FIXTURE");
    });
  });

  it("rejects a run status that contradicts its assertions", async () => {
    await withTempRepo(async (_root, paths) => {
      const report = validReport(paths);
      report.runs[0].status = "fail";
      writeJson(
        join(paths.evaluationsRoot, "reports", "2026-08-25-meteor-example-test.json"),
        report,
      );
      const findings = await findingsFor(paths);
      expect(findings.map((item) => item.code)).toContain(
        "E_EVAL_REPORT_STATUS",
      );
    });
  });

  it("requires three repetitions for reliability claims", async () => {
    await withTempRepo(async (_root, paths) => {
      const report = validReport(paths);
      report.claims = ["behavior", "reliability"];
      writeJson(
        join(paths.evaluationsRoot, "reports", "2026-08-25-meteor-example-test.json"),
        report,
      );
      const findings = await findingsFor(paths);
      expect(findings.map((item) => item.code)).toContain(
        "E_EVAL_REPORT_REPETITIONS",
      );
    });
  });

  it("rejects tracked raw work artifacts", async () => {
    await withTempRepo(async (_root, paths) => {
      const findings = await findingsFor(paths, [
        "evaluations/.work/run-1/response.txt",
      ]);
      expect(findings.map((item) => item.code)).toContain(
        "E_EVAL_TRACKED_WORK",
      );
    });
  });
});
