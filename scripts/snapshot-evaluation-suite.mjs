#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const suitesRoot = join(repoRoot, "evaluations", "skills");
const snapshotsRoot = join(repoRoot, "evaluations", "snapshots");

function isInside(root, candidate) {
  const rel = relative(resolve(root), resolve(candidate));
  return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

export function snapshotEvaluationSuite(
  input,
  {
    allowedSuitesRoot = suitesRoot,
    outputRoot = snapshotsRoot,
  } = {},
) {
  const source = resolve(input);
  if (
    !isInside(allowedSuitesRoot, source) ||
    !existsSync(source) ||
    lstatSync(source).isSymbolicLink() ||
    !lstatSync(source).isFile() ||
    !source.endsWith(`${sep}cases.json`)
  ) {
    throw new Error(`suite must exist under ${allowedSuitesRoot}: ${source}`);
  }
  const content = readFileSync(source);
  const sha256 = createHash("sha256").update(content).digest("hex");
  const target = join(resolve(outputRoot), `${sha256}.json`);
  mkdirSync(dirname(target), { recursive: true });
  if (existsSync(target)) {
    const existingDigest = createHash("sha256")
      .update(readFileSync(target))
      .digest("hex");
    if (existingDigest !== sha256) {
      throw new Error(`existing snapshot does not match its content address: ${target}`);
    }
  } else {
    copyFileSync(source, target);
  }
  return { source, target, sha256 };
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--") args.shift();
  if (args.length !== 1) {
    console.error("usage: node scripts/snapshot-evaluation-suite.mjs <evaluations/skills/.../cases.json>");
    process.exit(2);
  }
  const result = snapshotEvaluationSuite(args[0]);
  console.log(
    JSON.stringify({
      suite: relative(repoRoot, result.source).split(sep).join("/"),
      suite_snapshot: relative(repoRoot, result.target).split(sep).join("/"),
      suite_sha256: result.sha256,
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(`suite snapshot failed: ${error.message}`);
    process.exit(2);
  }
}
