#!/usr/bin/env node
// Package runtime content only, including both repository marketplace formats.
import { createWriteStream, lstatSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ZipArchive } from "archiver";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixedFiles = [
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "assets/meteor-icon.png",
  "LICENSE",
];

export async function buildPlugin({ root = repoRoot, out = join(root, "dist", "meteor-plugin.zip") } = {}) {
  const files = [...fixedFiles];
  function collect(relative) {
    const stat = lstatSync(join(root, relative));
    if (stat.isSymbolicLink()) throw new Error(`plugin content cannot be a symlink: ${relative}`);
    if (stat.isFile()) files.push(relative);
    else if (stat.isDirectory()) {
      for (const name of readdirSync(join(root, relative)).sort()) collect(`${relative}/${name}`);
    } else throw new Error(`unsupported plugin file: ${relative}`);
  }
  for (const entry of readdirSync(join(root, "skills"), { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    if (entry.isSymbolicLink()) throw new Error(`skill cannot be a symlink: ${entry.name}`);
    if (!entry.isDirectory()) continue;
    for (const child of readdirSync(join(root, "skills", entry.name))) {
      if (!["SKILL.md", "references", "scripts", "assets"].includes(child)) {
        throw new Error(`unexpected skill content: ${entry.name}/${child}`);
      }
      collect(`skills/${entry.name}/${child}`);
    }
  }
  // Check every fixed input before opening the output, and preserve source bytes.
  const contents = files.sort().map((name) => {
    if (!lstatSync(join(root, name)).isFile()) throw new Error(`expected a regular file: ${name}`);
    return [name, readFileSync(join(root, name)), lstatSync(join(root, name)).mode & 0o111 ? 0o755 : 0o644];
  });
  mkdirSync(dirname(out), { recursive: true });
  await new Promise((done, reject) => {
    const output = createWriteStream(out);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    output.on("close", done);
    output.on("error", reject);
    archive.on("warning", reject);
    archive.on("error", reject);
    archive.pipe(output);
    for (const [name, data, mode] of contents) {
      archive.append(data, { name, date: new Date("1980-01-01T00:00:00Z"), mode });
    }
    archive.finalize().catch(reject);
  });
  return { out, files };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildPlugin().then(({ out, files }) => console.log(`built ${out} (${files.length} files)`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
