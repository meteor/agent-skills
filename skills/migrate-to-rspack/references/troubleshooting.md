# Troubleshooting Rspack integration

## Reset state

```bash
meteor reset
rm -rf .meteor/local _build public/build-assets public/build-chunks private/build-assets
```

Clears every cache the integration owns.

## Memory crashes (OOM)

Rspack runs as a child process. Large apps may exhaust the default heap.

Meteor 3.4.1+:

```bash
TOOL_NODE_FLAGS="--max-old-space-size=16384" meteor run
```

Meteor 3.4:

```bash
NODE_OPTIONS="--max-old-space-size=16384" meteor run
```

`TOOL_NODE_FLAGS` propagates to Rspack and other Meteor tool processes.

Complementary: disable Rspack's persistent cache when investigating OOM
(persistent cache is memory-heavy).

```javascript
module.exports = defineConfig(Meteor => ({
  ...Meteor.setCache(false),       // or 'memory'
}));
```

Combine both: raise heap with `TOOL_NODE_FLAGS`, drop persistent cache.

Rspack 2.0 plans to lower RAM use; current numbers will improve.

## CI and Docker

Error in CI or Docker:

```text
Could not find rspack.config.js, rspack.config.ts, rspack.config.mjs, or rspack.config.cjs
```

Root cause: the npm-side deps required by the current Meteor version are
not in the lockfile because `meteor update --npm` was not committed after
the local Meteor upgrade. Also check the release contract: Meteor 3.4 uses
`@meteorjs/rspack` v1, while Meteor 3.4.1 uses v2.

Preferred fix: run the update locally, review it, and commit the lockfile:

```bash
meteor update --npm
meteor npm install
git add package.json package-lock.json
git commit -m "update rspack npm dependencies"
```

CI can then run `meteor npm ci && meteor build`. If the pipeline must repair
an incomplete upgrade defensively, use this fallback in the build step:

```dockerfile
RUN (meteor update --npm 2>/dev/null || true) && meteor npm install && meteor build [...]
```

The `2>/dev/null || true` keeps the step compatible with older Meteor
versions that lack `--npm` (3.4 introduced it).

Each Docker step or CI stage is isolated. Uncommitted npm bumps from one
stage do not carry into another. Prefer the committed dependency changes;
the fallback is a recovery mechanism, not the reproducible default.

## thread-stream worker error

```text
Error: Cannot find module '/_build/main-dev/lib/worker.js'
```

`thread-stream` (transitively used by Mongo packages) loads worker scripts
via filesystem paths Rspack rewrites. Send it to Meteor:

```javascript
const { defineConfig } = require('@meteorjs/rspack');

module.exports = defineConfig(Meteor => ({
  ...Meteor.compileWithMeteor(['thread-stream']),
}));
```

The same pattern fixes other worker-loading or native deps. Use
`compileWithMeteor` for: native code (`sharp`), Atmosphere-package
internals, large precompiled deps.

## Multiple instances on one machine

Default `.meteor/local` and `_build` paths conflict if two instances run.
Set `METEOR_LOCAL_DIR` per instance; the integration uses its basename as
a suffix for `_build`, `build-assets`, `build-chunks`.

```bash
PORT=3000 METEOR_LOCAL_DIR=.meteor/local-1 meteor run
PORT=3001 METEOR_LOCAL_DIR=.meteor/local-2 meteor run
```

## Verbose mode

`package.json`:

```json
{
  "meteor": {
    "modern": { "verbose": true }
  }
}
```

Shows the final Rspack config (after `extendConfig` / `extendSwcConfig`
merges) and lists each `[Transpiler]` step. Use this to diagnose Babel
fallbacks and config overrides.

For deeper Rspack-side logging, set `stats` and `infrastructureLogging` in
`rspack.config.js`:

```javascript
module.exports = defineConfig(Meteor => ({
  stats: 'detailed',
  infrastructureLogging: { level: 'info' },
}));
```

## Blaze HMR (limitation)

Blaze compiles under Rspack but Meteor's Blaze HMR is not available with
the integration. Blaze edits trigger a full reload instead of an
in-place update. Page state resets. This is a known limitation, not a
config error. Other frameworks keep HMR.

## Reporting issues

GitHub: https://github.com/meteor/meteor/issues  
Forums: https://forums.meteor.com

Compare before and after with `meteor profile`. Numbers help others
calibrate the migration cost.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/about/modern-build-stack/rspack-bundler-integration.md
