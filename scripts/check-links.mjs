#!/usr/bin/env node
// Walk every Markdown file in skills/ and verify:
//   1. Relative Markdown links resolve on disk.
//   2. Each "Source:" footer points at a real path on meteor/meteor@devel.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const RELATIVE_LINK = /\[[^\]]+\]\((\.\/[^)\s]+|\.\.\/[^)\s]+)\)/g;
const SOURCE_FOOTER =
  /^Source:\s*(https:\/\/github\.com\/meteor\/meteor\/blob\/devel\/[^\s]+)\s*$/m;

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

function gatherFiles(root, { singleSkill }) {
  if (singleSkill) {
    return walkMarkdown(root);
  }
  const skillDirs = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => join(root, e.name));
  return skillDirs.flatMap((d) => walkMarkdown(d));
}

function rawUrlFor(githubUrl) {
  return githubUrl.replace(
    "https://github.com/meteor/meteor/blob/",
    "https://raw.githubusercontent.com/meteor/meteor/",
  );
}

export async function checkLinks({
  root = join(repoRoot, "skills"),
  singleSkill = false,
  fetchImpl = globalThis.fetch,
  ignoreLocal = false,
} = {}) {
  const findings = [];
  const files = gatherFiles(root, { singleSkill });

  for (const file of files) {
    const text = readFileSync(file, "utf8");

    if (!ignoreLocal) {
      const fileDir = dirname(file);
      for (const match of text.matchAll(RELATIVE_LINK)) {
        const target = normalize(join(fileDir, match[1]));
        if (!existsSync(target)) {
          findings.push({
            code: "E_LINK_LOCAL",
            file,
            target,
            message: `relative link not found: ${match[1]}`,
          });
        }
      }
    }

    const sourceMatch = text.match(SOURCE_FOOTER);
    if (sourceMatch) {
      const url = rawUrlFor(sourceMatch[1]);
      try {
        const res = await fetchImpl(url, { method: "HEAD" });
        if (!res.ok) {
          findings.push({
            code: "E_LINK_REMOTE",
            file,
            url: sourceMatch[1],
            message: `Source: link returned HTTP ${res.status}`,
          });
        }
      } catch (err) {
        findings.push({
          code: "E_LINK_REMOTE",
          file,
          url: sourceMatch[1],
          message: `Source: fetch failed: ${err.message}`,
        });
      }
    }
  }

  return findings;
}

async function main() {
  const findings = await checkLinks();
  if (findings.length === 0) {
    console.log("check-links: OK");
    process.exit(0);
  }
  for (const f of findings) {
    console.log(`${f.code}\t${f.file}\t${f.message}`);
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("check-links crashed:", err);
    process.exit(2);
  });
}
