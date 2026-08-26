#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

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

function schemaValidators(schemasRoot, findings) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const files = {
    skill: join(schemasRoot, "skill-suite.schema.json"),
    routing: join(schemasRoot, "routing-suite.schema.json"),
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

function validateSkillSuites({ root, skillsRoot, validate, findings }) {
  const suitesRoot = join(root, "skills");
  if (!existsSync(suitesRoot)) {
    findings.push(finding("E_EVAL_SKILL_ROOT", suitesRoot, "skill suite root does not exist"));
    return;
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
  }
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
  validateSkillSuites({
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
