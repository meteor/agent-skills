#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;
const expectedCapabilities = ["Interactive", "Read", "Write"];

function readJson(root, relativePath, findings) {
  try {
    return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
  } catch (error) {
    findings.push({
      code: "E_PLUGIN_JSON",
      file: relativePath,
      message: error.message,
    });
    return null;
  }
}

function add(findings, code, file, message) {
  findings.push({ code, file, message });
}

export function validatePlugins({ root = repoRoot } = {}) {
  const findings = [];
  const codexPath = ".codex-plugin/plugin.json";
  const codexMarketplacePath = ".agents/plugins/marketplace.json";
  const claudePath = ".claude-plugin/plugin.json";
  const claudeMarketplacePath = ".claude-plugin/marketplace.json";
  const codex = readJson(root, codexPath, findings);
  const codexMarketplace = readJson(root, codexMarketplacePath, findings);
  const claude = readJson(root, claudePath, findings);
  const claudeMarketplace = readJson(root, claudeMarketplacePath, findings);

  if (!codex || !codexMarketplace || !claude || !claudeMarketplace) {
    return findings;
  }

  if (!codex.name || codex.name !== claude.name) {
    add(
      findings,
      "E_PLUGIN_NAME",
      claudePath,
      "Codex and Claude plugin names must match",
    );
  }

  if (!versionPattern.test(codex.version ?? "")) {
    add(
      findings,
      "E_PLUGIN_VERSION",
      codexPath,
      `invalid plugin version ${JSON.stringify(codex.version)}`,
    );
  }
  if (codex.version !== claude.version) {
    add(
      findings,
      "E_PLUGIN_VERSION_MISMATCH",
      claudePath,
      `Claude version ${JSON.stringify(claude.version)} does not match Codex version ${JSON.stringify(codex.version)}`,
    );
  }

  for (const [file, plugin] of [
    [codexPath, codex],
    [claudePath, claude],
  ]) {
    if (plugin.skills !== "./skills/" || !existsSync(join(root, "skills"))) {
      add(
        findings,
        "E_PLUGIN_SKILLS",
        file,
        'plugin skills must point to the repository "./skills/" directory',
      );
    }
  }

  if (
    JSON.stringify(codex.interface?.capabilities) !==
    JSON.stringify(expectedCapabilities)
  ) {
    add(
      findings,
      "E_PLUGIN_CAPABILITIES",
      codexPath,
      `capabilities must be ${JSON.stringify(expectedCapabilities)}`,
    );
  }

  const codexEntry = codexMarketplace.plugins?.[0];
  if (
    codexMarketplace.name !== codex.name ||
    codexMarketplace.plugins?.length !== 1 ||
    codexEntry?.name !== codex.name ||
    codexEntry?.source?.source !== "local" ||
    codexEntry?.source?.path !== "./"
  ) {
    add(
      findings,
      "E_CODEX_MARKETPLACE",
      codexMarketplacePath,
      "Codex marketplace entry must expose the root plugin by its manifest name",
    );
  }

  const claudeEntry = claudeMarketplace.plugins?.[0];
  if (
    claudeMarketplace.name !== claude.name ||
    claudeMarketplace.plugins?.length !== 1 ||
    claudeEntry?.name !== claude.name ||
    claudeEntry?.source !== "./"
  ) {
    add(
      findings,
      "E_CLAUDE_MARKETPLACE",
      claudeMarketplacePath,
      "Claude marketplace entry must expose the root plugin by its manifest name",
    );
  }

  return findings;
}

function main() {
  const findings = validatePlugins();
  if (findings.length === 0) {
    console.log("validate-plugins: OK");
    return;
  }
  for (const finding of findings) {
    console.log(`${finding.code}\t${finding.file}\t${finding.message}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
