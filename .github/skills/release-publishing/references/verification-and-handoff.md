# Release verification and handoff

## Stable consolidation

When catalog guidance targets an official Meteor release:

1. Resolve the final Meteor tag and peeled commit, the release-branch head and
   the audited catalog commit. Use `skill-gap-audit` to distinguish shipped
   behavior from later branch changes and to check earlier stable backports.
2. Scan every distributed skill body, reference, evaluation prompt, script
   and template for framework beta/RC pins and intermediate feature histories.
   Rewrite those decisions around the official version and earlier supported
   stable releases. Verify the final runtime and Atmosphere/npm versions;
   stripping a prerelease suffix does not establish the correct stable pin.
3. Preserve independently versioned package prereleases when still relevant,
   useful generic prerelease migration advice, and historical release/audit
   records. Catalog betas can test guidance for a stable Meteor framework.
   Do not replace catalog versions with the framework's version.
4. Rerun affected cases when consolidation changes a decision, default,
   compatibility boundary or example. Rebuild and scan both archive formats.
   A keyword scan finds candidates; review each match rather than deleting
   every occurrence of "beta" or "RC".
5. Apply the accepted-beta and final-candidate gates in `SKILL.md`. An
   uncreated stable tag must not appear as a working public install command.

## Package and install the candidate

Run both `pnpm run build:zips` and `pnpm run build:plugin` after validation.
Derive the expected skill count from the candidate inventory; do not hardcode
an earlier catalog's count. Verify:

| Artifact | Required contents and checks |
|---|---|
| `skills/*.zip` | One archive per published skill, with `SKILL.md` at its root and the skill's runtime files. |
| `dist/meteor-plugin.zip` | Both plugin manifests, marketplace files, shared artwork, license and every published skill. Verify referenced asset paths resolve. |
| Both formats | Compare extracted bytes with source, verify intended executable modes, and exclude audits, `.github/skills/`, release reports, dependencies and nested ZIPs. |

Repository marketplace validation does not establish directory approval.
Check current directory requirements and the actual artwork dimensions when
preparing an authorized submission. Keep account/listing approval separate
from release installation checks; directory review need not block the
repository release.

Test installations in disposable projects and isolated client profiles or
filesystem sandboxes. Keep the user's active plugin registry, settings and
credentials intact. Do not repurpose `HOME` or `CODEX_HOME`. Use supported
isolation or mount isolation; if unavailable, report the unverified install
path rather than silently changing the user's active plugins.

1. Install the complete candidate in Codex and Claude Code. Start fresh
   conversations and verify the selected skill and a supporting reference
   load from the installed candidate. Record revision, client version and
   actual loaded paths. Supplied-text prompts do not prove installed discovery.
2. Exercise one-skill and full-catalog Skills CLI installs. Repeat a selected
   install: verify its files/ref refresh and unselected skills remain intact.
3. Test an existing installation's update to the candidate. Account for
   version/cache behavior; removing and reinstalling a same-version local
   candidate does not prove a remote beta-to-stable upgrade works.
4. After publication, repeat from the exact tag and compare installed files
   with it. Record local checks, remote installs and upgrade results separately.
   An unpublished working tree with an old manifest version is not evidence
   about that previously published version.

Use `node scripts/smoke-install.mjs <tag>` from the repository root for the
isolated public Skills CLI checks, or omit the tag to select the latest
publication including betas. The PR and post-publication workflows run this
script. Record the shell's Node/npm versions as well as the installer version.
Test the documented `npx skills` command on its minimum supported Node version
and later Meteor Node generations. State that installer requirement beside the
public command. Test the older-Node fallback with `--installer 1.5.18` directly
on Meteor 3.0's Node 20.15.1 and Meteor 3.1's Node 22.11.0. Keep explicit
`skills@latest` checks separate. A passing fallback does not prove the default
command supports Node 20; installer requirements do not change app requirements.
Use `--agent codex --copy --yes` without a skill selector for the full catalog;
the compatible installer's `--all` includes internal maintainer skills. See
[published installation smoke checks](../../../../RELEASING.md#published-installation-smoke-checks)
for scope; this CI job does not replace client discovery or behavior checks.

## Retain release evidence

After the release and exact-tag installation checks succeed, consolidate
preparation material into one final `docs/releases/<tag>.md` handoff per
published version. Record the catalog tag/publish SHA, paired Meteor tag/SHA
when applicable, audit path/revision, CI links, client versions, behavior and
installation outcomes, artifact verification and remaining limitations.

Preserve committed `audits/skill-gaps/` reports unchanged and retain historical
published-release handoffs, including betas. A final handoff links to its audit;
it does not replace the audit as the next incremental comparison baseline.
Do not rewrite earlier reports to make them describe a later candidate.

Remove only superseded preparation drafts after carrying forward unique
findings, decisions and pending work, and update links in the same change.
Do not consolidate away active release gates before publication. Keep reusable
procedures in `RELEASING.md` and maintainer skills; a release index can link
versions to their handoffs and audits. Keep raw transcripts and temporary
projects outside the repository and all maintenance evidence outside ZIPs.
