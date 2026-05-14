---
name: migrate-to-meteor-3
description: >
  Use when migrating a Meteor 2.x application to Meteor 3.x. Triggers on
  callAsync, *Async Mongo methods, removed Fibers, ReferenceError on
  top-level globals after upgrade, Iron Router controllers silently not
  running, lost reactivity in Blaze helpers after async rewrites, "publish
  function returned a Promise", and Atmosphere packages failing to resolve
  after the upgrade. Use this skill when the user asks about upgrading
  Meteor, asks about sync to async rewrites, asks about iterators with
  await, or asks about replacing or forking third-party packages.
metadata:
  author: meteor
  version: "0.2.0"
  kind: knowledge
  meteor: ">=3.0"
  area: migration
  bundle: ["migration", "essentials"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Migrate a Meteor 2.x application to Meteor 3.x

Meteor 3 removed Fibers. Server-side Mongo APIs are async. The module system
enforces strict mode. Client reactivity inside async code needs care.
Atmosphere packages often need forking or replacement. Approach the migration
in phases. Do not flip the framework version flag first.

## Recommended strategy

1. Update the project to the latest 2.x release.
2. Migrate server-side sync Mongo calls to `*Async` siblings while still on
   2.x. See `references/async-rewrites.md` and `references/call-vs-callAsync.md`.
3. Audit Atmosphere packages. Find replacements or fork outdated ones; pin
   `api.versionsFrom(['2.x', '3.0'])`. See `references/package-triage.md`.
4. Upgrade to Meteor 3.x.
5. Sweep implicit globals; rewrite to `const` or `export` / `import`.
   See `references/module-system.md`.
6. Audit Blaze helpers and `Tracker.autorun` blocks for lost reactivity
   after `await`. See `references/client-reactivity.md`.
7. Replace iterators that contain `await` (`forEach`, `map`, `filter`) with
   `for...of` or `Promise.all`. See `references/js-iterators.md`.
8. Audit publications using internal cursor APIs (`_cursorDescription`,
   manual `sub.added`). Prefer returning cursors directly.
   See `references/publications.md`.

## Symptom router

| Symptom                                              | Reference                              |
|------------------------------------------------------|----------------------------------------|
| `TypeError: Collection.findOne is not a function`    | `references/async-rewrites.md`         |
| `Method returns undefined` or returns a `Promise`    | `references/async-rewrites.md`         |
| `Meteor.call` callback never fires                   | `references/call-vs-callAsync.md`      |
| `ReferenceError: X is not defined` at startup        | `references/module-system.md`          |
| Template renders, no data, Minimongo empty           | `references/module-system.md`          |
| Iron Router controller silently does not run         | `references/module-system.md`          |
| `{{> partial}}` renders nothing in Blaze             | `references/module-system.md`          |
| Page renders but live data never updates             | `references/client-reactivity.md`      |
| Blaze helper returns a `Promise`                     | `references/client-reactivity.md`      |
| Cursor `transform` errors with "returned a Promise"  | `references/publications.md`           |
| `sub.added` writes never reach the client            | `references/publications.md`           |
| Atmosphere package fails to resolve or build         | `references/package-triage.md`         |
| `forEach`/`map`/`filter` with `await` skips items    | `references/js-iterators.md`           |

## Anti-patterns

- Do not run `meteor update --release=3` first. Async-convert and
  package-triage on 2.x first.
- Do not global-replace `findOne` with `findOneAsync`. Many callers need
  rewriting, not just `await`.
- Do not use async Mongo on the client inside Blaze helpers or
  `Tracker.autorun`. Sync minimongo is the reactive path.
- Do not rely on Iron Router controller naming-convention lookup. Pass
  `controller:` explicitly on every route.
- Do not mix `await` and `.then()` in the same function. Pick one.
- Do not assume implicit globals work. Every top-level identifier in 3.x
  must be `const`, `let`, or `export`-ed.

## Effort shape

The mechanical work splits roughly:

- Server async conversion: 40 percent.
- Implicit globals to explicit imports: 25 percent.
- Package replacements and API upgrades: 20 percent.
- Client reactivity regressions from async: 15 percent.

Plan for two phases: pre-upgrade work on 2.x, then the version flip and
client cleanup.

## See also

- `references/async-rewrites.md`: sync-to-async rewrite mechanics.
- `references/call-vs-callAsync.md`: RPC migration.
- `references/removed-functions.md`: removed API inventory.
- `references/async-cheatsheet.md`: quick lookup table.
- `references/module-system.md`: strict mode, implicit globals, explicit imports, Iron Router controller trap.
- `references/client-reactivity.md`: Tracker reactivity inside async code.
- `references/publications.md`: cursor internals and the publish API.
- `references/package-triage.md`: Atmosphere dependency strategy.
- `references/js-iterators.md`: iterators that contain `await`.
- `references/eval-cases.md`: smoke-test prompts.

## Further reading (optional)

Real-world migration write-ups for context, not for fixing specific
issues. The symptom router above is sufficient on its own. Open
`references/community-case-studies.md` only when the user asks for
narrative case studies or wants to calibrate effort and timeline.
