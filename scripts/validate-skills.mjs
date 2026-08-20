#!/usr/bin/env node
// Validate every SKILL.md under skills/ against skill.schema.json and the
// Meteor-specific rules in AGENTS.md.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
const PLACEHOLDER_PATTERN = /\b(?:TODO|FIXME|TBD)\b/;
const PROHIBITED_EM_DASH = String.fromCodePoint(0x2014);

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

function isPublishable(name) {
  return !name.startsWith("_") && !name.startsWith(".");
}

function walkMarkdown(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

export function inspectPublishedContent(text) {
  const findings = [];
  if (PLACEHOLDER_PATTERN.test(text)) {
    findings.push({
      code: "E_PLACEHOLDER",
      message: "published Markdown contains TODO, FIXME, or TBD",
    });
  }
  if (text.includes(PROHIBITED_EM_DASH)) {
    findings.push({
      code: "E_PROHIBITED_EM_DASH",
      message: "published Markdown contains a prohibited em-dash character",
    });
  }
  return findings;
}

function configuredBundlesForSkill(bundles, skillName) {
  return Object.entries(bundles?.bundles ?? {})
    .filter(([, skillNames]) => skillNames.includes(skillName))
    .map(([bundleName]) => bundleName)
    .sort();
}

function listRepoTrackedFiles() {
  return execFileSync("git", ["ls-files", "-z", "--", "skills"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
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
  bundles,
  trackedFiles = [],
} = {}) {
  const a = getAjv();
  const validate = a.getSchema("skill");
  const findings = [];
  const seenNames = new Map();
  const publishableNames = new Set();
  const bundleConfig =
    bundles ??
    (resolve(root) === resolve(repoRoot, "skills")
      ? JSON.parse(readFileSync(join(repoRoot, "bundles.json"), "utf8"))
      : null);

  for (const trackedFile of trackedFiles) {
    if (trackedFile.startsWith("skills/") && trackedFile.endsWith(".zip")) {
      findings.push({
        code: "E_TRACKED_ZIP",
        folder: "skills",
        file: trackedFile,
        message: `built ZIP artifact is tracked by git: ${trackedFile}`,
      });
    }
  }

  const dirs = findSkillDirs(root, { singleSkill });
  for (const dir of dirs) {
    const folder = basename(dir);
    const file = join(dir, skillFileName);
    const publishable = isPublishable(folder);
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

    if (publishable) {
      const evalCases = join(dir, "references", "eval-cases.md");
      if (!existsSync(evalCases)) {
        findings.push({
          code: "E_MISSING_EVAL_CASES",
          folder,
          file: evalCases,
          message: "published skill is missing references/eval-cases.md",
        });
      }

      for (const markdownFile of walkMarkdown(dir)) {
        const text = readFileSync(markdownFile, "utf8");
        for (const contentFinding of inspectPublishedContent(text)) {
          findings.push({
            ...contentFinding,
            folder,
            file: markdownFile,
          });
        }
      }
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

    if (publishable) {
      publishableNames.add(data.name);
      if (bundleConfig) {
        const declaredBundles = [...(data.metadata.bundle ?? [])].sort();
        const configuredBundles = configuredBundlesForSkill(
          bundleConfig,
          data.name,
        );
        if (
          JSON.stringify(declaredBundles) !==
          JSON.stringify(configuredBundles)
        ) {
          findings.push({
            code: "E_BUNDLE_MISMATCH",
            folder,
            file,
            message: `metadata.bundle ${JSON.stringify(declaredBundles)} does not match bundles.json ${JSON.stringify(configuredBundles)}`,
          });
        }
      }
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

  if (bundleConfig) {
    const configuredSkillNames = new Set(
      Object.values(bundleConfig.bundles ?? {}).flat(),
    );
    for (const skillName of configuredSkillNames) {
      if (!publishableNames.has(skillName)) {
        findings.push({
          code: "E_BUNDLE_UNKNOWN_SKILL",
          folder: skillName,
          file: join(repoRoot, "bundles.json"),
          message: `bundles.json references unknown published skill "${skillName}"`,
        });
      }
    }
  }

  return findings;
}

async function main() {
  const findings = await validateSkills({
    trackedFiles: listRepoTrackedFiles(),
  });
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
