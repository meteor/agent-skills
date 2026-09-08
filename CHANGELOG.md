# Changelog

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
