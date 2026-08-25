#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  emptyEvaluationFixtureDigest,
  hashEvaluationFixture,
} from "./hash-evaluation-fixture.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const PROHIBITED_EM_DASH = String.fromCodePoint(0x2014);
const PLACEHOLDER_PATTERN = /\b(?:TODO|FIXME|TBD)\b/;

function finding(code, file, message) {
  return { code, file, message };
}

function readJson(file, findings) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    findings.push(finding("E_EVAL_JSON", file, `invalid JSON: ${error.message}`));
    return null;
  }
}

function walkJson(root, out = []) {
  if (!existsSync(root)) return out;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) walkJson(full, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function schemaValidators(schemasRoot, findings) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const files = {
    skill: join(schemasRoot, "skill-suite.schema.json"),
    routing: join(schemasRoot, "routing-suite.schema.json"),
    report: join(schemasRoot, "evaluation-report.schema.json"),
  };
  const validators = {};
  for (const [name, file] of Object.entries(files)) {
    const schema = readJson(file, findings);
    if (schema) validators[name] = ajv.compile(schema);
  }
  return validators;
}

function addSchemaFindings(validate, data, file, findings) {
  if (!validate || validate(data)) return true;
  for (const error of validate.errors ?? []) {
    findings.push(
      finding(
        "E_EVAL_SCHEMA",
        file,
        `${error.instancePath || "(root)"} ${error.message}`,
      ),
    );
  }
  return false;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates];
}

function publishedSkillNames(skillsRoot) {
  if (!existsSync(skillsRoot)) return new Set();
  return new Set(
    readdirSync(skillsRoot, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith("_") &&
          existsSync(join(skillsRoot, entry.name, "SKILL.md")),
      )
      .map((entry) => entry.name),
  );
}

function canonicalCaseRefs(skillsRoot, skill, findings) {
  const file = join(skillsRoot, skill, "references", "eval-cases.md");
  if (!existsSync(file)) {
    findings.push(
      finding("E_EVAL_CASE_SOURCE", file, "canonical eval-cases.md does not exist"),
    );
    return new Set();
  }
  const refs = new Set();
  for (const match of readFileSync(file, "utf8").matchAll(/^## (Case [1-9][0-9]*: .+)$/gm)) {
    refs.add(match[1]);
  }
  return refs;
}

function isInside(root, candidate) {
  const rel = relative(resolve(root), resolve(candidate));
  return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function validateSkillSuites({ root, skillsRoot, validate, findings }) {
  const suites = new Map();
  const suitesRoot = join(root, "skills");
  if (!existsSync(suitesRoot)) {
    findings.push(finding("E_EVAL_SKILL_ROOT", suitesRoot, "skill suite root does not exist"));
    return suites;
  }

  for (const entry of readdirSync(suitesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(suitesRoot, entry.name, "cases.json");
    if (!existsSync(file)) {
      findings.push(finding("E_EVAL_SUITE_MISSING", file, "skill suite cases.json does not exist"));
      continue;
    }
    const suite = readJson(file, findings);
    if (!suite || !addSchemaFindings(validate, suite, file, findings)) continue;

    if (suite.skill !== entry.name) {
      findings.push(
        finding(
          "E_EVAL_SKILL_MISMATCH",
          file,
          `suite skill "${suite.skill}" does not equal folder "${entry.name}"`,
        ),
      );
    }
    if (!existsSync(join(skillsRoot, suite.skill, "SKILL.md"))) {
      findings.push(
        finding("E_EVAL_UNKNOWN_SKILL", file, `unknown published skill "${suite.skill}"`),
      );
    }

    const refs = canonicalCaseRefs(skillsRoot, suite.skill, findings);
    const duplicateCaseIds = duplicateValues(suite.cases.map((item) => item.id));
    for (const id of duplicateCaseIds) {
      findings.push(finding("E_EVAL_DUPLICATE_CASE", file, `duplicate case id "${id}"`));
    }

    const tags = new Set(suite.cases.flatMap((item) => item.tags));
    if (!tags.has("representative")) {
      findings.push(finding("E_EVAL_COVERAGE", file, "suite needs a representative case"));
    }
    if (!tags.has("boundary") && !tags.has("failure")) {
      findings.push(finding("E_EVAL_COVERAGE", file, "suite needs a boundary or failure case"));
    }

    for (const item of suite.cases) {
      if (!refs.has(item.case_ref)) {
        findings.push(
          finding(
            "E_EVAL_CASE_REF",
            file,
            `case "${item.id}" does not match a heading in references/eval-cases.md: ${item.case_ref}`,
          ),
        );
      }
      for (const id of duplicateValues(item.assertions.map((assertion) => assertion.id))) {
        findings.push(
          finding(
            "E_EVAL_DUPLICATE_ASSERTION",
            file,
            `case "${item.id}" has duplicate assertion id "${id}"`,
          ),
        );
      }
      if (item.mode === "workspace") {
        const fixtureRoot = join(root, "fixtures");
        const fixture = join(fixtureRoot, item.fixture);
        if (
          !isInside(fixtureRoot, fixture) ||
          !existsSync(fixture) ||
          lstatSync(fixture).isSymbolicLink() ||
          !lstatSync(fixture).isDirectory()
        ) {
          findings.push(
            finding(
              "E_EVAL_FIXTURE",
              file,
              `case "${item.id}" fixture does not exist as a directory: ${item.fixture}`,
            ),
          );
        }
        if (!item.assertions.some((assertion) => ["files", "command"].includes(assertion.evidence))) {
          findings.push(
            finding(
              "E_EVAL_WORKSPACE_ASSERTION",
              file,
              `workspace case "${item.id}" needs files or command evidence`,
            ),
          );
        }
      }
    }
    suites.set(`evaluations/skills/${suite.skill}/cases.json`, { file, suite });
  }
  return suites;
}

function validateRoutingSuite({ root, skillNames, validate, findings }) {
  const file = join(root, "routing", "cases.json");
  if (!existsSync(file)) {
    findings.push(finding("E_EVAL_ROUTING_MISSING", file, "routing suite does not exist"));
    return;
  }
  const suite = readJson(file, findings);
  if (!suite || !addSchemaFindings(validate, suite, file, findings)) return;

  for (const id of duplicateValues(suite.cases.map((item) => item.id))) {
    findings.push(finding("E_EVAL_DUPLICATE_CASE", file, `duplicate routing case id "${id}"`));
  }
  for (const item of suite.cases) {
    const { primary, secondary, forbidden } = item.expected;
    const all = [primary, ...secondary, ...forbidden];
    for (const skill of all) {
      if (!skillNames.has(skill)) {
        findings.push(
          finding(
            "E_EVAL_UNKNOWN_ROUTE_SKILL",
            file,
            `routing case "${item.id}" references unknown skill "${skill}"`,
          ),
        );
      }
    }
    for (const skill of duplicateValues(all)) {
      findings.push(
        finding(
          "E_EVAL_ROUTE_OVERLAP",
          file,
          `routing case "${item.id}" assigns "${skill}" to multiple expectations`,
        ),
      );
    }
  }
}

function expectedAssertionIds(suite, caseId) {
  const item = suite.cases.find((candidate) => candidate.id === caseId);
  return item ? item.assertions.map((assertion) => assertion.id).sort() : null;
}

function validateSnapshots({ root, validate, findings }) {
  const snapshots = new Map();
  const snapshotsRoot = join(root, "snapshots");
  for (const file of walkJson(snapshotsRoot)) {
    if (dirname(file) !== snapshotsRoot) {
      findings.push(
        finding("E_EVAL_SNAPSHOT_PATH", file, "suite snapshots must be direct files under evaluations/snapshots"),
      );
      continue;
    }
    const digest = sha256(file);
    if (basename(file) !== `${digest}.json`) {
      findings.push(
        finding("E_EVAL_SNAPSHOT_DIGEST", file, "snapshot filename does not match its SHA-256 content digest"),
      );
    }
    const suite = readJson(file, findings);
    if (!suite || !addSchemaFindings(validate, suite, file, findings)) continue;
    for (const id of duplicateValues(suite.cases.map((item) => item.id))) {
      findings.push(
        finding("E_EVAL_SNAPSHOT_CASE", file, `snapshot has duplicate case id "${id}"`),
      );
    }
    for (const item of suite.cases) {
      for (const id of duplicateValues(item.assertions.map((assertion) => assertion.id))) {
        findings.push(
          finding(
            "E_EVAL_SNAPSHOT_ASSERTION",
            file,
            `snapshot case "${item.id}" has duplicate assertion id "${id}"`,
          ),
        );
      }
    }
    snapshots.set(`evaluations/snapshots/${basename(file)}`, { file, suite, digest });
  }
  return snapshots;
}

function validateReports({ root, validators, suites, snapshots, findings }) {
  const reportsRoot = join(root, "reports");
  for (const file of walkJson(reportsRoot)) {
    const rel = relative(reportsRoot, file);
    if (!/^\d{4}-\d{2}-\d{2}-.+\.json$/.test(basename(file))) {
      findings.push(
        finding("E_EVAL_REPORT_NAME", file, "report filename must start with YYYY-MM-DD-"),
      );
    }
    const raw = readFileSync(file, "utf8");
    if (raw.includes(PROHIBITED_EM_DASH) || PLACEHOLDER_PATTERN.test(raw)) {
      findings.push(
        finding("E_EVAL_REPORT_CONTENT", file, "report contains placeholder text or an em-dash"),
      );
    }
    const report = readJson(file, findings);
    if (!report || !addSchemaFindings(validators.report, report, file, findings)) continue;

    const target = suites.get(report.suite);
    if (!target) {
      findings.push(
        finding("E_EVAL_REPORT_SUITE", file, `report references unknown suite "${report.suite}"`),
      );
      continue;
    }
    const snapshot = snapshots.get(report.suite_snapshot);
    if (!snapshot) {
      findings.push(
        finding("E_EVAL_REPORT_SNAPSHOT", file, `report references unknown suite snapshot "${report.suite_snapshot}"`),
      );
      continue;
    }
    if (
      snapshot.digest !== report.suite_sha256 ||
      basename(snapshot.file) !== `${report.suite_sha256}.json`
    ) {
      findings.push(
        finding("E_EVAL_REPORT_DIGEST", file, "suite_sha256 does not match the immutable suite snapshot"),
      );
    }
    if (snapshot.suite.skill !== target.suite.skill) {
      findings.push(
        finding("E_EVAL_REPORT_SUITE", file, "current suite and immutable snapshot belong to different skills"),
      );
    }

    const runKeys = report.runs.map(
      (run) => `${run.case_id}:${run.repetition}:${run.condition}`,
    );
    for (const key of duplicateValues(runKeys)) {
      findings.push(finding("E_EVAL_DUPLICATE_RUN", file, `duplicate run "${key}"`));
    }

    const groups = new Map();
    for (const run of report.runs) {
      const expected = expectedAssertionIds(snapshot.suite, run.case_id);
      if (!expected) {
        findings.push(
          finding("E_EVAL_REPORT_CASE", file, `run references unknown case "${run.case_id}"`),
        );
        continue;
      }
      const actual = run.assertions.map((assertion) => assertion.id).sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        findings.push(
          finding(
            "E_EVAL_REPORT_ASSERTIONS",
            file,
            `run ${run.case_id}:${run.repetition}:${run.condition} does not use the suite assertion set`,
          ),
        );
      }
      const allAssertionsPassed = run.assertions.every(
        (assertion) => assertion.passed,
      );
      if (
        (run.status === "pass" && !allAssertionsPassed) ||
        (run.status === "fail" && allAssertionsPassed)
      ) {
        findings.push(
          finding(
            "E_EVAL_REPORT_STATUS",
            file,
            `run ${run.case_id}:${run.repetition}:${run.condition} status does not match its assertion outcomes`,
          ),
        );
      }
      const suiteCase = snapshot.suite.cases.find(
        (candidate) => candidate.id === run.case_id,
      );
      const currentSuiteMatchesSnapshot = sha256(target.file) === snapshot.digest;
      const expectedFixtureDigest = suiteCase?.mode === "advisory"
        ? emptyEvaluationFixtureDigest()
        : currentSuiteMatchesSnapshot
          ? hashEvaluationFixture(join(root, "fixtures", suiteCase.fixture))
          : null;
      if (expectedFixtureDigest && run.fixture_sha256 !== expectedFixtureDigest) {
        findings.push(
          finding(
            "E_EVAL_REPORT_FIXTURE",
            file,
            `run ${run.case_id}:${run.repetition}:${run.condition} does not use the canonical starting fixture digest`,
          ),
        );
      }
      const groupKey = `${run.case_id}:${run.repetition}`;
      const group = groups.get(groupKey) ?? [];
      group.push(run);
      groups.set(groupKey, group);
    }

    for (const [key, runs] of groups) {
      if (report.mode === "smoke" && runs.some((run) => run.condition !== "current-skill")) {
        findings.push(
          finding("E_EVAL_REPORT_CONDITION", file, `smoke group "${key}" may only use current-skill`),
        );
      }
      if (report.mode === "comparison") {
        const conditions = new Set(runs.map((run) => run.condition));
        if (!conditions.has("current-skill") || !conditions.has("without-skill")) {
          findings.push(
            finding(
              "E_EVAL_REPORT_MATCHING",
              file,
              `comparison group "${key}" needs current-skill and without-skill runs`,
            ),
          );
        }
        if (new Set(runs.map((run) => run.fixture_sha256)).size !== 1) {
          findings.push(
            finding(
              "E_EVAL_REPORT_FIXTURE",
              file,
              `comparison group "${key}" used different fixture digests`,
            ),
          );
        }
      }
    }

    if (report.runs.some((run) => run.condition === "previous-skill") && !report.comparison?.previous_skill_revision) {
      findings.push(
        finding("E_EVAL_REPORT_BASELINE", file, "previous-skill runs need previous_skill_revision"),
      );
    }
    if (report.claims.some((claim) => ["reliability", "time", "tokens"].includes(claim))) {
      const repetitions = new Map();
      for (const run of report.runs) {
        const key = `${run.case_id}:${run.condition}`;
        repetitions.set(key, (repetitions.get(key) ?? new Set()).add(run.repetition));
      }
      for (const [key, values] of repetitions) {
        if (values.size < 3) {
          findings.push(
            finding(
              "E_EVAL_REPORT_REPETITIONS",
              file,
              `claim requires at least three repetitions for "${key}"`,
            ),
          );
        }
      }
    }
  }
}

function trackedEvaluationFiles() {
  return execFileSync("git", ["ls-files", "-z", "--", "evaluations/.work"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

export async function validateEvaluations({
  root = join(repoRoot, "evaluations"),
  skillsRoot = join(repoRoot, "skills"),
  schemasRoot = join(root, "schemas"),
  trackedFiles = [],
} = {}) {
  const findings = [];
  const validators = schemaValidators(schemasRoot, findings);
  for (const file of trackedFiles) {
    if (file === "evaluations/.work" || file.startsWith("evaluations/.work/")) {
      findings.push(
        finding("E_EVAL_TRACKED_WORK", file, "raw evaluation work artifacts must not be tracked"),
      );
    }
  }
  const skillNames = publishedSkillNames(skillsRoot);
  const suites = validateSkillSuites({
    root,
    skillsRoot,
    validate: validators.skill,
    findings,
  });
  validateRoutingSuite({
    root,
    skillNames,
    validate: validators.routing,
    findings,
  });
  const snapshots = validateSnapshots({
    root,
    validate: validators.skill,
    findings,
  });
  validateReports({ root, validators, suites, snapshots, findings });
  return findings;
}

async function main() {
  const findings = await validateEvaluations({ trackedFiles: trackedEvaluationFiles() });
  if (findings.length === 0) {
    console.log("validate-evaluations: OK");
    return;
  }
  for (const item of findings) {
    console.log(`${item.code}\t${item.file}\t${item.message}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("validate-evaluations crashed:", error);
    process.exit(2);
  });
}
