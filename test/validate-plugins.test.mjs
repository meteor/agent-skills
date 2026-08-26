import { describe, expect, it } from "@rstest/core";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validatePlugins } from "../scripts/validate-plugins.mjs";

function writeJson(root, relativePath, value) {
  const path = join(root, relativePath);
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function withPluginRoot(run) {
  const root = mkdtempSync(join(tmpdir(), "meteor-plugin-validation-"));
  try {
    mkdirSync(join(root, "skills"));
    const codex = {
      name: "meteor",
      version: "0.1.0-beta.1",
      skills: "./skills/",
      interface: { capabilities: ["Interactive", "Read", "Write"] },
    };
    const claude = {
      name: "meteor",
      version: "0.1.0-beta.1",
      skills: "./skills/",
    };
    const codexMarketplace = {
      name: "meteor",
      plugins: [
        {
          name: "meteor",
          source: { source: "local", path: "./" },
        },
      ],
    };
    const claudeMarketplace = {
      name: "meteor",
      plugins: [{ name: "meteor", source: "./" }],
    };
    writeJson(root, ".codex-plugin/plugin.json", codex);
    writeJson(root, ".agents/plugins/marketplace.json", codexMarketplace);
    writeJson(root, ".claude-plugin/plugin.json", claude);
    writeJson(root, ".claude-plugin/marketplace.json", claudeMarketplace);
    return run({ root, codex, claude, codexMarketplace });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("validatePlugins", () => {
  it("accepts matching plugin packaging", () => {
    withPluginRoot(({ root }) => {
      expect(validatePlugins({ root })).toEqual([]);
    });
  });

  it("rejects inconsistent release metadata", () => {
    withPluginRoot(({ root, codex, claude, codexMarketplace }) => {
      claude.version = "0.1.0";
      codex.interface.capabilities = ["Read"];
      codexMarketplace.plugins[0].name = "other";
      writeJson(root, ".claude-plugin/plugin.json", claude);
      writeJson(root, ".codex-plugin/plugin.json", codex);
      writeJson(
        root,
        ".agents/plugins/marketplace.json",
        codexMarketplace,
      );

      const codes = validatePlugins({ root }).map(({ code }) => code);
      expect(codes).toContain("E_PLUGIN_VERSION_MISMATCH");
      expect(codes).toContain("E_PLUGIN_CAPABILITIES");
      expect(codes).toContain("E_CODEX_MARKETPLACE");
    });
  });
});
