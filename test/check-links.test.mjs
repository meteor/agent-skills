import { describe, it, expect, rstest } from "@rstest/core";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkLinks } from "../scripts/check-links.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, "fixtures");

describe("checkLinks", () => {
  it("flags missing relative link with E_LINK_LOCAL", async () => {
    const findings = await checkLinks({
      root: join(fixturesDir, "invalid/broken-link"),
      singleSkill: true,
      fetchImpl: rstest.fn().mockResolvedValue({ ok: true, status: 200 }),
    });
    expect(findings.map((f) => f.code)).toContain("E_LINK_LOCAL");
  });

  it("flags missing v3-docs source with E_LINK_REMOTE", async () => {
    const stubFetch = rstest.fn().mockResolvedValue({ ok: false, status: 404 });
    const findings = await checkLinks({
      root: join(fixturesDir, "invalid/broken-link"),
      singleSkill: true,
      fetchImpl: stubFetch,
    });
    expect(findings.map((f) => f.code)).toContain("E_LINK_REMOTE");
  });

  it("accepts an existing v3-docs source", async () => {
    const stubFetch = rstest.fn().mockResolvedValue({ ok: true, status: 200 });
    const findings = await checkLinks({
      root: join(fixturesDir, "invalid/broken-link"),
      singleSkill: true,
      fetchImpl: stubFetch,
      ignoreLocal: true,
    });
    expect(findings.map((f) => f.code)).not.toContain("E_LINK_REMOTE");
  });

  it("accepts repository maintainer skill links", async () => {
    const findings = await checkLinks({
      root: join(here, "..", ".github", "skills"),
      fetchImpl: rstest.fn().mockResolvedValue({ ok: true, status: 200 }),
    });
    expect(findings.map((f) => f.code)).not.toContain("E_LINK_LOCAL");
  });
});
