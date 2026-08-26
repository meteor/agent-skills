#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const manifestPaths = [
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
];
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function usage() {
  fail(
    "usage: plugin-version.mjs [--check] <X.Y.Z|X.Y.Z-beta.N>",
  );
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const checkOnly = args[0] === "--check";
const [input, ...extra] = checkOnly ? args.slice(1) : args;
if (!input || extra.length > 0) {
  usage();
}

const version = input.startsWith("v") ? input.slice(1) : input;
if (!versionPattern.test(version)) {
  fail(`invalid plugin version: ${input}`);
}

const manifests = manifestPaths.map((relativePath) => {
  const path = resolve(repoRoot, relativePath);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`cannot read ${relativePath}: ${error.message}`);
  }
  return { relativePath, path, data };
});

if (checkOnly) {
  const mismatches = manifests.filter(({ data }) => data.version !== version);
  if (mismatches.length > 0) {
    for (const { relativePath, data } of mismatches) {
      console.error(
        `${relativePath} has version ${JSON.stringify(data.version)}, expected ${version}`,
      );
    }
    process.exit(1);
  }
  console.log(`plugin manifests match ${version}`);
  process.exit(0);
}

for (const manifest of manifests) {
  manifest.data.version = version;
}
for (const { path, data } of manifests) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`set plugin manifests to ${version}`);
