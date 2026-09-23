# Changelog

## 1.1.0-beta.1 - 2026-09-23

Catalog maintenance for Meteor 3.6-beta.1. The catalog grows to 17 skills;
existing classifications and earlier Meteor 3 compatibility branches remain.

### Added

- `meteor-typescript`: app declaration providers, native generation,
  TypeScript/JavaScript configuration, editor resolution and local/CI checks.
  Migration and build skills retain their owners and hand off declaration work.

### Updated

- Add explicit native TypeScript declaration migration, provider preservation,
  failure recovery, TypeScript 7 configuration and verified app-source checking.
- Cover package-gated Accounts cookie protections, same-origin refresh,
  passwordless payload validation and distinct HTTP/DDP rate-limit counters.
- Match deployment, migration and CI to beta.1's Node 26.8.2/npm 11.19.0,
  including native dependency rebuilds and earlier Node 24 targets.
- Add server instrumentation lifecycle observation, correlation, privacy
  controls, cleanup and authorization boundaries.
- Update the exact Rspack beta pairing and diagnose TypeScript rebuild loops,
  host-prefixed ports and inspector output without broad resets.
- Explain pending optimistic-write snapshot merging, scoped client cleanup
  and the uWebSockets DDP negotiation fix.

### Maintenance

- Preserve the pinned Meteor source audit and implementation evidence outside
  distributable skills; record 30 passing affected cases and three routing checks.
- Version both plugin manifests as `1.1.0-beta.1`.
- Publish betas from the existing open release PR without merging its branch.

[Compare with beta.0](https://github.com/meteor/agent-skills/compare/v1.1.0-beta.0...v1.1.0-beta.1).

## 1.1.0-beta.0 - 2026-09-11

Beta for Meteor 3.6-beta.0 (`release-3.6`). The catalog keeps its 16 skills
and existing Meteor 3 compatibility branches.

### Updated

- Match the exact beta Rspack integration and coordinated Rspack 2 dependencies;
  migrate app-owned CSS, cache, merge, and output configuration.
- Clarify automatic Rspack dependency updates on normal startup, explicit
  opt-out preparation, and Node/ESM/dev-server/resolution compatibility checks.
- Add Svelte/TypeScript and Lingui/SWC migration lessons from examples PR #50,
  preserving compatible tooling and verifying actual compiler hosts and input
  paths. Add feature-level validation and reproducible beta feedback guidance.
- Add pnpm workspace scaffolding, root package-manager and lockfile ownership,
  local dependency protocols, and immutable CI installation guidance.
- Support SWC React Compiler on the beta pairing, with React 17/18 runtime
  targets and the Babel fallback for earlier integrations.
- Correct the `test-in-browser@1.6.0` jQuery harness regression and document
  the restored dependency in `1.6.1-beta360.0` without adding production jQuery.
- Diagnose package shrinkwrap migration, exact Git dependency caching,
  isolated Windows argon2 installation, scoped proxy failures, SWC cache
  writes, and development-only web HMR.
- Add the dependency-free Blaze PWA scaffold, URL-prefix and cache/update
  checks, and boundaries for offline data, native apps, and existing Workbox.
- Consolidate skeleton selection and framework-neutral PWA/Workbox guidance
  in the modern-build skill, using Notes Offline to distinguish worker caching
  from offline data persistence and replay.
- Clarify worker scope, offline replay APIs, shared retention configuration
  and named cleanup exports through focused acceptance cases.
- Distinguish interactive Atmosphere discovery from scripted installation and
  reviewed Git-source adoption with reproducible local-package provenance.

### Maintenance

- Update the build-time `js-yaml@3` override to 3.15.2 for
  [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh).
- Preserve the incremental source audit against the exact Meteor beta commit.
- Preserve the pinned examples follow-up audit and add nine Rspack migration
  acceptance cases, including older-version and working-plugin near misses.
- Add version-boundary acceptance cases and record verification, the final
  merged-source audit, and the beta review exception in the
  [release handoff](docs/releases/v1.1.0-beta.0.md).
- Version both plugin manifests as `1.1.0-beta.0`.

[Compare with beta.3](https://github.com/meteor/agent-skills/compare/v1.0.0-beta.3...v1.1.0-beta.0).

## 1.0.0-beta.3 - 2026-09-08

The catalog grows from 14 to 16 skills and adds guidance for Meteor 3.5.2.

### Added

- `meteor-native`: Android/iOS setup, persistent configuration, Cordova plugins,
  device networking, signed artifacts, and hot code push.
- `meteor-cli-installation`: CLI installation, PATH repair, release selection,
  cache recovery, and scoped reinstall decisions that preserve application data.

### Updated

- Document seven resolved Cordova issues: cached HCP manifests, Android background
  colors, transitive plugin dependencies, URLSearchParams startup failures, runtime
  iterator polyfills, Rspack development proxies, and modern-build defaults.
- Match Rspack integration versions to Meteor 3.5.2. Cover separate development,
  test and full-app outputs, generated asset paths, and dependency-install opt-outs.
- Explain full-app test loading, top-level await, parent `private` directory
  discovery, and version-specific jQuery requirements.
- Add HttpOnly cookie endpoint diagnostics and OAuth handling guidance for
  Meteor 3.5.2.
- Cover DDP URL derivation, Mongo change-stream replay fixes, redacted connection
  diagnostics, Android SDK 36 requirements, and macOS watcher behavior.
- Check native configuration as well as compatibility hashes before HCP rollout.
  Route native builds and signing to `meteor-native` and backend deployment to
  `meteor-deployment`.
- Show method authorization with `this.userId` and `Meteor.userId()`.
- Document skill and plugin updates, removal, and installation management.

### Maintenance

- Expand acceptance cases and preserve source audits outside distributable skills.
- Document independent catalog releases and optional coordination with Meteor
  releases using exact tags and recorded revisions.
- Update the `fast-uri` dependency override to 3.1.6.
- Move the Claude maintainer instructions to `.claude/CLAUDE.md` and check both
  marketplace and plugin manifests in strict mode.

[Compare with beta.2](https://github.com/meteor/agent-skills/compare/v1.0.0-beta.2...v1.0.0-beta.3).

## Earlier releases

- [1.0.0-beta.2](https://github.com/meteor/agent-skills/releases/tag/v1.0.0-beta.2)
- [1.0.0-beta.1](https://github.com/meteor/agent-skills/releases/tag/v1.0.0-beta.1)
