# First stable Meteor Agent Skills release

We are close, but I would not tag the stable release yet. Most Meteor 3.6
workflows are already covered. The remaining work is specific: finish the
last Accounts and Mongo guidance, verify the final catalog through the
installation paths, and synchronize the public docs.

The distribution strategy is already implemented. We do not need another
repository, a hosted service, or an npm package to ship this catalog.

This review compares `main` at `9f41f99` with official Meteor 3.6 at
`e730097ce42a0dbc4c134aeb1706147b02112844`. The current `release-3.6` head is
`092fa6f6057ce6eb53bb04b3561291e73838fd8c`; its two later commits correct
documentation, without changing runtime behavior. The detailed source
evidence and all 17 skill owners are in the
[pre-edit audit](../../audits/skill-gaps/2026-11-10-meteor-3.6-stable.md).

The changes are on `prepare/first-stable-release` for draft PR review.
No catalog version has been tagged or published. The Core checkout and
unrelated user files were left intact.

## What changed since the last published beta

The latest catalog release is still
[`v1.1.0-beta.3`](https://github.com/meteor/agent-skills/releases/tag/v1.1.0-beta.3),
published September 29. Main is ahead of that release. It already contains:

- The cumulative Meteor 3.6 RC work, including custom Accounts collections,
  cookie-session retry behavior and additional passwordless request guidance.
- Galaxy CLI ownership and MongoDB provisioning clarifications.
- The reported Blaze, testing and Methods fixes from PR #32.
- Dependency validation and CodeQL maintenance.

There are no open GitHub issues in this repository at the time of this review.
That is useful housekeeping, but the release comparison still found gaps.

The main 3.6 workflows are present: Rspack 2 migration, pnpm workspaces,
PWA scaffolding, interactive/Git package installation, instrumentation,
architecture-specific entries, modern Cordova fetch, retained local MongoDB
upgrade preparation and native TypeScript adoption. We do not need a new
published skill for any confirmed finding.

## Changes prepared in this branch

I consolidated the distributed content around official Meteor 3.6 across
65 Markdown files in 16 skills. `meteor-methods` needed no release-wording
change. The edits include references and acceptance prompts, since those
files are distributed too.

- Commands now target `3.6`. The tables have one stable 3.6 row instead of
  separate beta/RC histories.
- Runtime guidance uses Node 26.13.0 and npm 11.20.0. Earlier stable Meteor
  versions keep their own runtime mappings.
- Rspack guidance uses Atmosphere `rspack@1.4.0` / `tools-core@1.4.0`, npm
  `@meteorjs/rspack@3.0.0`, core/CLI 2.2.7 and dev server 2.2.1.
- Final package identities are taken from the release, including
  `mongo@2.6.0`, `ddp-server@3.6.0`, `dynamic-import@0.8.1` and
  `test-in-browser@1.6.2`. Removing suffixes alone would have got these wrong.
- New TypeScript, TypeScript + Tailwind, Svelte and Angular scaffolds use
  native declarations and generate them during `meteor create`. Upgrading
  an existing app preserves its provider. The skill now states both paths.
- Added acceptance cases for those scaffold defaults and TypeScript 6+
  stylesheet import errors. Earlier-version cases now use actual earlier
  stable Meteor releases.

There are no Meteor 3.6 beta/RC version references left in the distributed
skills or generated ZIPs. Independent Blaze 3.1 alpha/beta compatibility
guidance remains: calling that package stable because Meteor 3.6 is stable
would be incorrect. Generic advice for moving away from prerelease package
constraints also remains useful.

Historical audits and catalog release records retain their original versions.
The README and plugin manifests still describe the last published catalog;
they must change when the new catalog version is prepared. No stable tag or
installation result is advertised before it exists.

## What is still missing

These are confirmed source gaps, separate from the consolidation implemented
above. Fix the first three before claiming complete Meteor 3.6 coverage.

| Priority | Work | Why it matters | Owner and acceptance |
|---|---|---|---|
| Before stable | Change Streams version floor and large-event recovery | The skill still says MongoDB 6+. The final driver requires MongoDB 6.0.9+ or 7+, splits large events, and resynchronizes after non-resumable failures before releasing pending writes. | `meteor-mongo-minimongo`, with a debugging handoff. Add MongoDB 6.0.8 and oversized-event cases; preserve earlier Meteor branches and fallback behavior. Audit S03. |
| Before stable | Native Google/Facebook token validation | Native sign-in must prove that the token belongs to the configured application. Existing guidance does not explain Google ID tokens/`additionalClientIds` or Facebook's matching app ID. | `meteor-accounts`, with native/security handoffs. Test valid native clients, wrong-app rejection and unchanged web OAuth. Audit S04. |
| Before stable | Passwordless completion, 2FA and one-time tokens | Request validation is covered, but user-level tokens must respect 2FA and cannot be consumed twice. Email codes and user-level tokens have different email-verification effects. | Accounts passwordless/password-flow references. Test concurrent use, missing/invalid 2FA, email state and stale verification attempts. Audit S05. |
| Include in the same pass | Deployment discovery rejection | Automatic discovery now accepts trusted Galaxy HTTPS destinations. `DEPLOY_HOSTNAME` is an explicit custom-host decision, not a generic way to silence an error. | Deployment/Galaxy reference, with rejected discovery and intentional custom-host cases. Audit S06. |
| Useful follow-up | `Meteor.UserServices` augmentation and OAuth declaration diagnostics | The generation workflow is present, but these final type improvements have no focused example/case. | `meteor-typescript`; add a small augmentation case if recurring support warrants it. Audit S07. |

Sources: [Change Streams guide](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/v3-docs/docs/performance/change-streams-observer-driver.md),
[Google sign-in](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/v3-docs/docs/packages/accounts-google.md),
[Facebook sign-in](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/v3-docs/docs/packages/accounts-facebook.md),
[passwordless behavior](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/v3-docs/docs/packages/accounts-passwordless.md),
and [deployment discovery](https://github.com/meteor/meteor/blob/e730097ce42a0dbc4c134aeb1706147b02112844/tools/meteor-services/deploy.js).

The framework's proxy parser, prototype-field handling, DDP dispatch,
dynamic-import request limits and other internal security fixes do not each
need an application skill. Keep application validation and authorization
guidance, recommend supported patched versions, and avoid inventing app
workarounds for already-fixed internals. Check package/backport floors before
claiming any protection exists only on 3.6.

## Verification completed

| Check | Result |
|---|---|
| Frozen dependency installation | Passed using the repository's pnpm 9.12.0. The local Volta pnpm shim was unavailable, so the pinned CLI ran through `npx`. No global installation change. |
| Skill/plugin validator | Passed. |
| Link checker | Passed. |
| Catalog generation and consistency | Passed; generated README content did not change. |
| Automated tests | 34 passed across 5 files. |
| Dependency audit | No known vulnerabilities at the configured moderate threshold. |
| Claude marketplace and plugin manifests | Both strict checks passed on Claude Code 2.1.312. Both emitted an `ICON_MISSING` directory warning. |
| ZIP build and content verification | 17 archives, 118 files. Every file matches source byte for byte. Maintainer workflows, audits and reports are excluded. |
| Meteor prerelease content scan | No 3.6 beta/RC or associated prerelease package pins in distributed Markdown or ZIP contents. |
| Diff whitespace check | Passed. |

Eight targeted acceptance prompts passed in fresh Claude Code conversations:

| Skill | Cases | Checked behavior |
|---|---|---|
| `meteor-typescript` | 2, 7, 16, 17 | Existing-provider preservation, pre-3.6 declarations, new native scaffolds and TS2882. |
| `meteor-modern-build-stack` | 31, 35 | Final dependency/native-type distinction and an older architecture near miss. |
| `meteor-deployment` | 18 | Pinned 3.5.x apps retain Node 24. |
| `migrate-to-rspack` | 37 | Backup/FCV before upgrade, final dependencies, native rebuilds, preserved provider and immutable CI. |

The prompts received the relevant skill/reference text with grading criteria
hidden. Tools were disabled, and raw output stayed outside the repository.
These checks test the guidance. They do not prove automatic skill discovery,
remote installation, a real database upgrade or deployed application behavior.
No full Meteor runtime suite or device test was run.

Main's existing [validation CI](https://github.com/meteor/agent-skills/actions/runs/42796737791)
and [CodeQL](https://github.com/meteor/agent-skills/actions/runs/42796737752)
were green at `9f41f99`. The new branch needs its own exact-commit CI after
review and commit.

## Distribution: what we already have and what remains

| Channel | Current state | Remaining work |
|---|---|---|
| GitHub release | Tag workflow validates the manifests and publishes one ZIP per skill. | Publish the selected catalog version and verify all 17 assets against the tag. |
| Codex repository marketplace | `.agents/plugins/marketplace.json` and `.codex-plugin/plugin.json` already exist. The installed Codex 0.164.0 supports the documented CLI commands. | Test installation from the final exact tag in a disposable profile, including a fresh conversation and loaded references. |
| Claude Code repository marketplace | `.claude-plugin` manifests already exist and validate. | Repeat exact-tag installation and an installed-plugin conversation. Verify updating an existing beta installation too. |
| Individual skills and bundles | Existing `npx skills` installation and generated bundle commands. | Test one skill, the full catalog, and replacement of an existing selection against the exact tag. |
| OpenAI public directory | Repository distribution does not create a directory listing. | Prepare a complete plugin ZIP, approved listing text and branded icons; validate and submit from the publisher account. |
| Anthropic directory | Separate from our self-hosted marketplace. | Submit the GitHub plugin through the developer portal from an eligible publisher account. |

OpenAI currently supports skills-only plugins and retains the Codex manifest
as a compatibility format. Public submission needs a complete plugin package;
our per-skill ZIPs are not that package. Add `logo` and `composerIcon` assets
for the Codex distribution package. Skills-only submissions do not need MCP
review cases or a demo recording. We do not need to build an MCP server for
this catalog. See [packaging](https://developers.openai.com/plugins/build/plugins)
and [submission requirements](https://developers.openai.com/plugins/deploy/submission).

Claude supports our existing repository marketplace without a submission
form. Wider discovery uses its directory portal; this is separate from
`claude-plugins-official`, whose listing requires the relevant partner route.
Keep plugin versions moving: a changed repository with an unchanged manifest
version can leave existing installs on old content. See
[Claude publishing guidance](https://code.claude.com/docs/en/plugins/publish).

My estimate: the existing-channel release preparation is a small task once
content and behavior checks are accepted. Directory preparation is roughly
half a day to a day if branding and publisher access are ready, plus external
review time we cannot promise. Directory approval does not need to block the
GitHub/repository-marketplace release. It should block any claim that we are
already listed in those directories.

## Meteor Core documentation synchronization

Yes, update the existing Agent Skills guide for this launch. It is already
at `v3-docs/docs/ai/agent-skills.md`; we do not need to create another page.
Its coverage table currently omits three owners: `meteor-cli-installation`,
`meteor-native` and `meteor-typescript`.

Prepare these Core documentation changes alongside the catalog release:

1. Update that coverage table and explain the stable catalog version versus
   the supported Meteor versions. Prefer one tested, tag-pinned generic
   install command; link to catalog release notes for client-specific details.
2. Add a short Agent Skills link near `meteor create` in
   `v3-docs/docs/cli/index.md` and, if useful, in the installation/getting-started
   flow. A new application does not install an assistant plugin automatically.
3. After the stable catalog is published and remotely verified, add the
   paired Agent Skills section to
   `v3-docs/docs/generators/changelog/versions/3.6.0.md`, with the actual tag
   and tested command. Regenerate history through Core's normal workflow.
   A catalog release treated as independent would not add that paired section.
4. Verify the live docs and default/recommended release metadata. The
   [3.6 GitHub release](https://github.com/meteor/meteor/releases/tag/release/METEOR%403.6)
   exists, but GitHub's `/releases/latest` endpoint still returned 3.5.3 during
   this audit. Resolve that launch inconsistency deliberately.

I interpreted the ambiguous “PostgreSQL and create API” phrase as the Agent
Skills page and `meteor create` documentation. PostgreSQL is not a feature of
this Meteor 3.6 release or an existing catalog owner, so it is not a required
launch dependency. If PostgreSQL was literal, its intended project/API needs
a separate scope. No Core files were edited in this pass.

Automatic skill installation from `meteor create` would be separate CLI
product work: explicit agent/scope selection, noninteractive behavior,
existing-install handling and failure behavior. A documentation link gives
users the current supported route without delaying this release.

## Release sequence

1. Close S03-S06 in the existing owners, add their focused cases, and run
   them against the final Meteor 3.6 behavior. Complete the outside-contributor
   Claude Code/Cursor review required by [AGENTS.md](../../AGENTS.md).
   Earlier beta exceptions do not establish stable acceptance.
2. Review this branch, commit the accepted preparation and require green CI
   on that exact content. Record the Meteor tag, catalog commit, audit path,
   tested clients and results. Merge the reviewed stable candidate through
   the normal repository process when authorized.
3. Publish and test an updated catalog beta before stable promotion. The
   [release-publishing skill](../../.github/skills/release-publishing/SKILL.md)
   explicitly says: “If its guidance changed afterward, publish and test
   another beta before stable promotion.” Main contains behavioral changes
   beyond the accepted September beta, so this gate applies. This is an
   Agent Skills test release; its guidance still targets official Meteor 3.6.
   Use an explicitly selected unused version, for example `1.1.0-beta.4`.
4. Once accepted, I recommend `1.1.0` for the first stable catalog. It follows
   the existing `1.1.0-beta.*` sequence; there is no requirement to restart
   at `1.0.0`, and it should not be renamed `3.6.0`. Catalog and framework
   versions describe different things.
5. Run `pnpm release:bump 1.1.0` when preparing that selected candidate. Update
   both manifests, README status and pinned commands, changelog, and a stable
   release handoff. Keep package.json private and individual skills unversioned.
6. Reconcile the final clean candidate with this audit and any subsequent
   changes. Repeat repository checks, local installation checks, changed cases
   and ZIP inspection. Confirm the paired Meteor packages, tool builds and
   bootstrap downloads are available; the GitHub release alone does not prove
   all of those artifacts are live.
7. Publish the immutable `v1.1.0` tag from the reviewed default-branch commit.
   Verify the release assets, exact-tag Codex/Claude/Skills CLI installations,
   and the beta-to-stable update path. Record hashes and client versions.
8. Publish the synchronized Core docs and announcement with the same verified
   tag. Submit directory listings when their package, branding and account
   details are ready. Assign an owner for feedback and future catalog patches.

The generic stable command, once that tag exists and passes verification, is:

```bash
npx skills@latest add 'meteor/agent-skills#v1.1.0'
```

The remaining release blockers are the concrete content gaps and acceptance
evidence above. Distribution infrastructure is already in place.
