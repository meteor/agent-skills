# Build debugging

Read this reference when the failure occurs before the spawned server runs, or
when build, rebuild, bundle size, memory, SWC, or Rspack behavior is unclear.

## Separate tool from server

`--inspect` and `--inspect-brk` target the spawned server process, not the
Meteor tool or bundler. Start with:

1. Complete build output and the earliest error.
2. `.meteor/release`, `.meteor/versions`, `.meteor/packages`, `package.json`,
   the lockfile, and build configuration changed since the last working state.
3. `meteor run --verbose` for build output hidden by normal formatting.
4. One profile or build-specific log source selected below.

## Profile by Meteor release

Meteor 3.0 and 3.1 use the earlier build timing output:

```bash
METEOR_PROFILE=1 meteor
```

Meteor 3.2+ adds `meteor profile`:

```bash
meteor profile --build
meteor profile --size-only
```

Compare the same release, dependency state, architecture, command, and warm or
cold cache. A single profile does not prove the cause. Change one variable and
repeat.

## Debug output and source maps

```bash
meteor build ../build --debug
```

This creates unminified output and preserves source maps. Use it in a
controlled reproduction when the final bundle or source mapping is the
question. Do not deploy it as an incident-response shortcut.

## Modern stack and Rspack

Inspect the resolved `rspack` Atmosphere package and `@meteorjs/rspack` npm
versions before selecting an API. Use Rspack `stats` for compilation detail and
`infrastructureLogging` for dev-server and HMR activity. Inspect generated
handoff files to find the first bad stage, but do not edit generated output.

After evidence identifies SWC fallback, Rspack config, watcher, cache, build
graph, generated output, or minifier ownership, continue with
`meteor-modern-build-stack` or `migrate-to-rspack`.

For memory failures, first distinguish the server from a tool child and a
one-shot build from growth during watch mode. Meteor 3.4.1+ can pass a measured
tool heap change through `TOOL_NODE_FLAGS`; Meteor 3.4.0 uses `NODE_OPTIONS` for
the Rspack child. Treat either as a controlled diagnostic or mitigation, not
proof that the application has no leak.

Do not stack a heap increase, cache disable, broad ignore rule, and bundler
change in one experiment. The result cannot identify which variable mattered.

Meteor 3.5.2 fails promptly if Rspack exits or panics before its first compile.
Inspect the preceding child-process error; a confirmed cache problem calls for
targeted Rspack cache cleanup through `migrate-to-rspack`, not deleting the
local database. `rspack@1.3.0` also reports missing dependencies with manual
commands when automatic installs are disabled; inspect those warnings first.

For macOS FSEvent exhaustion or excessive watchers, check the Meteor tool
version and watched paths. Meteor 3.5.2 stops watching immutable package
warehouse files. Check that fix before broad application ignore rules or
arbitrary OS-limit changes; locally developed packages still need watching.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/cli/index.md
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/generators/changelog/versions/3.5.2.md
