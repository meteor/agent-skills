# Troubleshooting Rspack integration

## Preserve evidence first

Create a checkpoint. Reproduce with one exact command and record the build mode,
Meteor and integration versions, duration, exit status, first exception, and
expected artifact. Change one variable per attempt. Keep a change only when the
failure or a quantitative measurement improves, and revert disproven changes
before testing the next hypothesis.

## Reset state

```bash
meteor reset
rm -rf .meteor/local _build public/build-assets public/build-chunks private/build-assets
```

Clears every cache the integration owns. Capture logs or generated output first;
resetting state can erase the evidence needed to distinguish a stale cache from
a deterministic compiler failure.

## Memory crashes (OOM)

Rspack runs as a child process. Large apps may exhaust the default heap. First
distinguish a one-shot build failure from growth across a long watch session.
Inventory large directories beneath the app root and compare `.meteorignore`
with `.gitignore`. Check the exact Meteor/Rspack release for known fixes.

Meteor 3.4.1+:

```bash
TOOL_NODE_FLAGS="--max-old-space-size=16384" meteor run
```

Meteor 3.4.0:

```bash
NODE_OPTIONS="--max-old-space-size=16384" meteor run
```

`TOOL_NODE_FLAGS` propagates to Rspack and other Meteor tool processes.

As a separate experiment, disable Rspack's persistent cache when investigating
watch-mode growth:

```javascript
module.exports = defineConfig(Meteor => ({
  ...Meteor.setCache(false),       // or 'memory'
}));
```

Do not combine both changes initially. A heap increase is a temporary mitigation;
cache disabling trades rebuild performance for memory. Measure each separately.
If neither changes the retained-memory shape, capture a heap snapshot or Rspack
stats instead of stacking more configuration changes.

## Generated output differs from source

Meteor still assembles the final bundle after Rspack compiles app code. If only
production or a legacy web architecture fails, compare source, Rspack output,
the generated Meteor-facing module, and the final bundle. Identify the first
stage that introduces an invalid helper import or syntax before changing
application code or `.swcrc`. Check for a framework fix and reduce a reproducer
before keeping a pipeline workaround.

## CI and Docker

Error in CI or Docker:

```text
Could not find rspack.config.js, rspack.config.ts, rspack.config.mjs, or rspack.config.cjs
```

Root cause: the npm-side deps required by the current Meteor version are
not in the lockfile because `meteor update --npm` was not committed after
the local Meteor upgrade. Also check the release contract: Meteor 3.4.0 uses
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

`thread-stream`, commonly reached through logging stacks such as `pino`, loads
worker scripts via filesystem paths Rspack rewrites. Send it to Meteor:

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
