#!/usr/bin/env node
// Build a <name>.zip artifact for every publishable skill under skills/.
// Skips folders whose name starts with "_" or "." (the _template stays
// internal). The archive top level mirrors the skill folder contents:
// SKILL.md, references/, scripts/, assets/.

import { readdirSync, createWriteStream, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

function isPublishable(name) {
  return !name.startsWith("_") && !name.startsWith(".");
}

function zipSkill(srcDir, outFile) {
  return new Promise((resolveZip, reject) => {
    const output = createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolveZip(archive.pointer()));
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") return;
      reject(err);
    });
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

export async function buildZips({
  root = join(repoRoot, "skills"),
  out = join(repoRoot, "skills"),
} = {}) {
  if (!existsSync(out)) mkdirSync(out, { recursive: true });

  const skillDirs = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isPublishable(e.name))
    .map((e) => ({ name: e.name, src: join(root, e.name) }));

  const built = [];
  for (const { name, src } of skillDirs) {
    const target = join(out, `${name}.zip`);
    const bytes = await zipSkill(src, target);
    built.push({ name, target, bytes });
  }
  return built;
}

async function main() {
  const built = await buildZips();
  for (const b of built) {
    console.log(`built ${b.name}.zip (${b.bytes} bytes)`);
  }
  if (built.length === 0) {
    console.log("no skills to zip");
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("build-zips crashed:", err);
    process.exit(2);
  });
}
