#!/usr/bin/env node
// Exercise the public Skills CLI against a published tag, outside the checkout.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const repository = "meteor/agent-skills";
const tagPattern = /^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/;

export function selectRelease(releases, requested = "latest") {
  const published = releases.filter((release) => !release.draft && release.published_at);
  const release = requested === "latest"
    ? published.sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0]
    : published.find((item) => item.tag_name === requested);
  assert(release && tagPattern.test(release.tag_name), `No published catalog release for ${requested}`);
  return release;
}

export function snapshot(root) {
  assert(!lstatSync(root).isSymbolicLink(), `Unexpected installed symlink: ${root}`);
  const files = {};
  function walk(relative = "") {
    for (const entry of readdirSync(join(root, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      const path = join(root, name);
      assert(!entry.isSymbolicLink(), `Unexpected installed symlink: ${name}`);
      if (entry.isDirectory()) walk(name);
      else {
        assert(entry.isFile(), `Unexpected installed file type: ${name}`);
        files[name] = {
          sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
          executable: Boolean(lstatSync(path).mode & 0o111),
        };
      }
    }
  }
  walk();
  return files;
}

export function verifyInstallation(source, installed, names) {
  assert.deepEqual(readdirSync(installed).sort(), [...names].sort(), "Installed skill inventory differs");
  let fileCount = 0;
  for (const name of names) {
    const expected = snapshot(join(source, name));
    assert.deepEqual(snapshot(join(installed, name)), expected, `Installed contents differ: ${name}`);
    fileCount += Object.keys(expected).length;
  }
  return fileCount;
}

async function github(path) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal: AbortSignal.timeout(30_000),
  });
  assert(response.ok, `GitHub ${path}: HTTP ${response.status}`);
  return response.json();
}

export async function smokeInstall({ requested = "latest", installerSpec = "1.5.18" } = {}) {
  assert(requested === "latest" || tagPattern.test(requested), "Use latest or an exact vX.Y.Z[-beta.N] tag");
  assert(installerSpec === "latest" || /^\d+\.\d+\.\d+$/.test(installerSpec), "Use latest or an exact Skills CLI version");
  // /releases/latest excludes prereleases. Resolve the newest publication including betas.
  const releases = requested === "latest"
    ? await github("releases?per_page=100")
    : [await github(`releases/tags/${encodeURIComponent(requested)}`)];
  const release = selectRelease(releases, requested);
  const tag = release.tag_name;
  const root = mkdtempSync(join(tmpdir(), "meteor-published-install-"));
  const source = join(root, "source");
  const selected = join(root, "selected");
  const full = join(root, "full");
  const cache = join(root, "npm-cache");
  const { GH_TOKEN, GITHUB_TOKEN, ...environment } = process.env;
  // Project-only installs and a fresh npm cache, without global installation flags.
  const env = { ...environment, npm_config_cache: cache, DISABLE_TELEMETRY: "1", CI: "1", GIT_TERMINAL_PROMPT: "0" };
  const npxPrefix = ["--yes", `skills@${installerSpec}`];
  function run(command, args, cwd = root) {
    console.log(`$ ${command} ${args.join(" ")}`);
    try {
      return execFileSync(command, args, { cwd, env, encoding: "utf8", timeout: 180_000, maxBuffer: 4 * 1024 * 1024 }).trim();
    } catch (error) {
      if (error.stdout) console.error(String(error.stdout));
      throw error;
    }
  }
  function install(cwd, args) {
    const output = run("npx", [...npxPrefix, "add", `${repository}#${tag}`, ...args, "--agent", "codex", "--copy", "--yes"], cwd);
    assert(existsSync(join(cwd, ".agents", "skills")), `Installer produced no skills:\n${output}`);
  }
  try {
    mkdirSync(selected);
    mkdirSync(full);
    const installer = run("npx", [...npxPrefix, "--version"]);
    const npm = run("npm", ["--version"]);
    run("git", ["-c", "advice.detachedHead=false", "clone", "--quiet", "--depth", "1", "--branch", tag, `https://github.com/${repository}.git`, source]);
    const revision = run("git", ["rev-parse", "HEAD"], source);
    for (const client of [".codex-plugin", ".claude-plugin"]) {
      assert.equal(JSON.parse(readFileSync(join(source, client, "plugin.json"), "utf8")).version, tag.slice(1));
    }
    const skills = join(source, "skills");
    const names = readdirSync(skills).filter((name) => existsSync(join(skills, name, "SKILL.md"))).sort();
    assert(names.length > 0, "Published catalog has no skills");
    const assets = release.assets.map((asset) => asset.name).sort();
    assert.deepEqual(assets.filter((name) => name.endsWith(".zip")), [...names.map((name) => `${name}.zip`), "meteor-plugin.zip"].sort(), "Release ZIP inventory differs");

    const target = "meteor-mongo-minimongo";
    const control = "meteor-accounts";
    install(selected, ["--skill", target, "--skill", control]);
    const installed = join(selected, ".agents", "skills");
    verifyInstallation(skills, installed, [target, control]);
    // A selected reinstall must restore changed files while leaving unselected content intact.
    writeFileSync(join(installed, target, "SKILL.md"), "temporary smoke-test modification\n");
    appendFileSync(join(installed, control, "SKILL.md"), "\nUnselected local content must survive.\n");
    const untouched = snapshot(join(installed, control));
    install(selected, ["--skill", target]);
    assert.deepEqual(snapshot(join(installed, target)), snapshot(join(skills, target)), "Selected skill was not refreshed");
    assert.deepEqual(snapshot(join(installed, control)), untouched, "Unselected skill was changed");

    // In 1.5.18, --all includes internal maintainer skills and overrides --agent.
    // --yes with no skill selector installs the public inventory for the chosen agent.
    install(full, []);
    const files = verifyInstallation(skills, join(full, ".agents", "skills"), names);
    const summary = [
      `Published catalog: ${tag} (${revision})`,
      `Host Node: ${process.version}; npm: ${npm}; installer: skills ${installer} (requested ${installerSpec})`,
      `PASS: selected install, selected refresh, unselected preservation, full catalog (${names.length} skills / ${files} files).`,
      `PASS: installed bytes, executable modes, both manifest versions, release ZIP inventory (${assets.filter((name) => name.endsWith(".zip")).length}).`,
      "Scope: Skills CLI installation. Plugin discovery, model behavior and ZIP byte verification remain separate checks.",
    ].join("\n");
    console.log(summary);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n### Published installation smoke test\n\n${summary.split("\n").map((line) => `- ${line}`).join("\n")}\n`);
    return { tag, revision, skills: names.length, files };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values, positionals } = parseArgs({ options: { installer: { type: "string" } }, allowPositionals: true });
  if (positionals.length > 1) throw new Error("Usage: node scripts/smoke-install.mjs [latest|vX.Y.Z] [--installer X.Y.Z]");
  smokeInstall({ requested: positionals[0] || "latest", installerSpec: values.installer }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
