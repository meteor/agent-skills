#!/usr/bin/env node
// Generate the README catalog and bundles install snippets.
// CLI: --write (default) rewrites README.md; --check exits 1 if stale.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const SKILLS_BEGIN = "<!-- SKILLS:BEGIN -->";
const SKILLS_END = "<!-- SKILLS:END -->";
const BUNDLES_BEGIN = "<!-- BUNDLES:BEGIN -->";
const BUNDLES_END = "<!-- BUNDLES:END -->";

const AREA_TITLES = {
  migration: "Migration",
  build: "Build",
  data: "Data",
  auth: "Auth",
  security: "Security",
  testing: "Testing",
  ops: "Ops",
  meta: "Meta",
};

function titleFor(area) {
  return AREA_TITLES[area] ?? area.replace(/^\w/, (c) => c.toUpperCase());
}

function isPublishable(name) {
  return !name.startsWith("_") && !name.startsWith(".");
}

function loadSkills(skillsRoot) {
  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isPublishable(e.name))
    .map((e) => {
      const raw = readFileSync(join(skillsRoot, e.name, "SKILL.md"), "utf8");
      const { data } = matter(raw);
      return { folder: e.name, frontmatter: data };
    });
}

function renderSkills(skills, repoSlug) {
  const grouped = new Map();
  for (const s of skills) {
    const area = s.frontmatter.metadata?.area ?? "other";
    if (!grouped.has(area)) grouped.set(area, []);
    grouped.get(area).push(s);
  }
  const areas = [...grouped.keys()].sort();
  const lines = [];
  for (const area of areas) {
    lines.push(`### ${titleFor(area)}`);
    lines.push("");
    const sorted = grouped.get(area).sort((a, b) =>
      a.frontmatter.name.localeCompare(b.frontmatter.name),
    );
    for (const s of sorted) {
      const desc = s.frontmatter.description.trim().replace(/\s+/g, " ");
      lines.push(`- **\`${s.frontmatter.name}\`**: ${desc}`);
      lines.push("");
      lines.push("  ```bash");
      lines.push(`  npx skills add ${repoSlug} --skill ${s.frontmatter.name}`);
      lines.push("  ```");
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n+$/, "");
}

function renderBundles(bundles, repoSlug) {
  const lines = [];
  for (const [name, skillNames] of Object.entries(bundles.bundles)) {
    lines.push(`### \`${name}\``);
    lines.push("");
    lines.push("```bash");
    lines.push(
      `npx skills add ${repoSlug} ${skillNames
        .map((s) => "--skill " + s)
        .join(" ")}`,
    );
    lines.push("```");
    lines.push("");
    lines.push("Or via `bundles.json`:");
    lines.push("");
    lines.push("```bash");
    lines.push(`npx skills add ${repoSlug} \\`);
    lines.push(
      `  $(curl -sf https://raw.githubusercontent.com/${repoSlug}/main/bundles.json \\`,
    );
    lines.push(
      `    | jq -r '.bundles["${name}"] | map("--skill " + .) | join(" ")')`,
    );
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n").replace(/\n+$/, "");
}

function replaceBlock(text, beginMarker, endMarker, body) {
  const beginIdx = text.indexOf(beginMarker);
  const endIdx = text.indexOf(endMarker);
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    throw new Error(
      `markers ${beginMarker} / ${endMarker} not found or out of order`,
    );
  }
  const before = text.slice(0, beginIdx + beginMarker.length);
  const after = text.slice(endIdx);
  return `${before}\n${body}\n${after}`;
}

export async function generateCatalog({
  skillsRoot = join(repoRoot, "skills"),
  bundles,
  readmePath = join(repoRoot, "README.md"),
  mode = "write",
  repoSlug = "meteor/agent-skills",
} = {}) {
  const bundlesData =
    bundles ??
    JSON.parse(readFileSync(join(repoRoot, "bundles.json"), "utf8"));

  const skills = loadSkills(skillsRoot);
  const skillsBlock = renderSkills(skills, repoSlug);
  const bundlesBlock = renderBundles(bundlesData, repoSlug);

  const original = readFileSync(readmePath, "utf8");
  let next = replaceBlock(original, SKILLS_BEGIN, SKILLS_END, skillsBlock);
  next = replaceBlock(next, BUNDLES_BEGIN, BUNDLES_END, bundlesBlock);

  if (mode === "write") {
    if (original !== next) writeFileSync(readmePath, next, "utf8");
    return { ok: true, drift: "" };
  }
  if (mode === "check") {
    if (original === next) return { ok: true, drift: "" };
    return {
      ok: false,
      drift:
        "README.md is out of sync with skill frontmatter or bundles.json; run `pnpm run catalog:write`.",
    };
  }
  throw new Error(`unknown mode: ${mode}`);
}

async function main() {
  const mode = process.argv.includes("--check") ? "check" : "write";
  const result = await generateCatalog({ mode });
  if (!result.ok) {
    console.error(result.drift);
    process.exit(1);
  }
  console.log(mode === "write" ? "catalog: written" : "catalog: in sync");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("generate-catalog crashed:", err);
    process.exit(2);
  });
}
