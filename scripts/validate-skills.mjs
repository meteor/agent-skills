#!/usr/bin/env node
// Validate every SKILL.md under skills/ against skill.schema.json and the
// Meteor-specific rules in AGENTS.md.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const TRIGGER_PATTERNS = [
  /\bUse when\b/i,
  /\bUse this Skill when\b/i,
  /\bUse this skill when\b/i,
  /\bTriggers on\b/i,
  /\basks? about\b/i, // "ask about" / "asks about"
];

const BODY_BYTE_CAP = 8 * 1024;

let ajv;
function getAjv() {
  if (ajv) return ajv;
  ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const schemaPath = join(repoRoot, "skill.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  ajv.addSchema(schema, "skill");
  return ajv;
}

function findSkillDirs(root, { singleSkill = false } = {}) {
  if (singleSkill) {
    return [root];
  }
  const entries = readdirSync(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => join(root, e.name));
}

function countTriggerPhrases(description) {
  return TRIGGER_PATTERNS.reduce(
    (count, re) => (re.test(description) ? count + 1 : count),
    0,
  );
}

export async function validateSkills({
  root = join(repoRoot, "skills"),
  singleSkill = false,
  skillFileName = "SKILL.md",
} = {}) {
  const a = getAjv();
  const validate = a.getSchema("skill");
  const findings = [];
  const seenNames = new Map();

  const dirs = findSkillDirs(root, { singleSkill });
  for (const dir of dirs) {
    const folder = basename(dir);
    const file = join(dir, skillFileName);
    let raw;
    try {
      raw = readFileSync(file, "utf8");
    } catch (err) {
      findings.push({
        code: "E_MISSING_SKILL_MD",
        folder,
        file,
        message: `SKILL.md not found in ${dir}`,
      });
      continue;
    }
    const parsed = matter(raw);
    const data = parsed.data;
    const body = parsed.content;

    if (!validate(data)) {
      for (const err of validate.errors ?? []) {
        findings.push({
          code: "E_SCHEMA",
          folder,
          file,
          path: err.instancePath || "(root)",
          message: err.message,
        });
      }
      continue;
    }

    if (data.name !== folder) {
      findings.push({
        code: "E_FOLDER_MISMATCH",
        folder,
        file,
        message: `frontmatter name "${data.name}" does not equal folder "${folder}"`,
      });
    }

    const triggers = countTriggerPhrases(data.description ?? "");
    if (triggers < 2) {
      findings.push({
        code: "E_TRIGGER_PHRASES",
        folder,
        file,
        message: `description has ${triggers} trigger phrase(s); need >=2`,
      });
    }

    const bodyBytes = Buffer.byteLength(body, "utf8");
    if (bodyBytes > BODY_BYTE_CAP) {
      findings.push({
        code: "E_BODY_TOO_LARGE",
        folder,
        file,
        message: `body is ${bodyBytes} bytes; cap is ${BODY_BYTE_CAP}`,
      });
    }

    if (seenNames.has(data.name)) {
      findings.push({
        code: "E_DUPLICATE_NAME",
        folder,
        file,
        message: `duplicate name "${data.name}"; first seen in ${seenNames.get(data.name)}`,
      });
    } else {
      seenNames.set(data.name, folder);
    }
  }

  return findings;
}

async function main() {
  const findings = await validateSkills();
  if (findings.length === 0) {
    console.log("validate-skills: OK");
    process.exit(0);
  }
  for (const f of findings) {
    console.log(`${f.code}\t${f.folder}\t${f.message}`);
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("validate-skills crashed:", err);
    process.exit(2);
  });
}
