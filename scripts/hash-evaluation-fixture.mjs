#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const HASH_HEADER = "meteor-agent-skills-fixture-v1\0";

function fixtureFiles(root, current = root, out = []) {
  const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) =>
    a.name === b.name ? 0 : a.name < b.name ? -1 : 1,
  );
  for (const entry of entries) {
    const full = join(current, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`fixture symlinks are not supported: ${full}`);
    }
    if (entry.isDirectory()) fixtureFiles(root, full, out);
    else if (entry.isFile()) out.push(full);
    else throw new Error(`unsupported fixture entry: ${full}`);
  }
  return out;
}

export function hashEvaluationFixture(root) {
  const absoluteRoot = resolve(root);
  if (
    !existsSync(absoluteRoot) ||
    lstatSync(absoluteRoot).isSymbolicLink() ||
    !lstatSync(absoluteRoot).isDirectory()
  ) {
    throw new Error(`fixture directory does not exist: ${absoluteRoot}`);
  }
  const hash = createHash("sha256");
  hash.update(HASH_HEADER);
  for (const file of fixtureFiles(absoluteRoot)) {
    const content = readFileSync(file);
    const path = relative(absoluteRoot, file).split(sep).join("/");
    hash.update(`file\0${path}\0${content.byteLength}\0`);
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function emptyEvaluationFixtureDigest() {
  return createHash("sha256").update(HASH_HEADER).digest("hex");
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--") args.shift();
  const input = args[0];
  if (!input || args.length !== 1) {
    console.error("usage: node scripts/hash-evaluation-fixture.mjs <directory>");
    process.exit(2);
  }
  const absolute = resolve(input);
  console.log(
    JSON.stringify({
      fixture: (relative(repoRoot, absolute) || ".").split(sep).join("/"),
      sha256: hashEvaluationFixture(absolute),
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(`fixture digest failed: ${error.message}`);
    process.exit(2);
  }
}
