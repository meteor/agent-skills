---
name: meteor-async-migration
description: >
  Use when migrating a Meteor 2.x application to Meteor 3.x. Triggers on
  callAsync, findOneAsync, insertAsync, updateAsync, removeAsync, fetchAsync,
  removing Fibers, top-level await, and "X is not a function" errors after
  upgrade. Use this skill when the user asks about sync to async rewrites,
  asks about async cursors, or asks about Meteor.call replacements.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: migration
  bundle: ["migration", "essentials"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Meteor 3 async migration

Meteor 3 removed Fibers. Every server-side Mongo operation and most public
APIs that used to be synchronous are now async. Migration is mechanical but
broad: every callsite must be visited.

## Decision flow

1. Is this code path running on the server? If yes, sync Mongo APIs no longer
   work. Switch to `*Async` variants and `await` them.
2. Is the caller already `async`? If not, mark it `async` and propagate up the
   call stack until you reach a top-level await or a framework boundary.
3. Is this a `Meteor.call`? Switch to `Meteor.callAsync` and `await`.
4. Is this a publication using cursor transforms? Confirm the transform is
   synchronous. Async transforms require the low-level publish API
   (`this.added` / `this.changed` / `this.removed`).
5. Is this a client-side Minimongo call? Leave it alone. Minimongo on the
   client stays synchronous in Meteor 3.

## Rewrites (sync to async)

| 2.x                              | 3.x                                          |
|----------------------------------|----------------------------------------------|
| `Collection.find(q).fetch()`     | `await Collection.find(q).fetchAsync()`      |
| `Collection.findOne(q)`          | `await Collection.findOneAsync(q)`           |
| `Collection.insert(doc)`         | `await Collection.insertAsync(doc)`          |
| `Collection.update(q, mod)`      | `await Collection.updateAsync(q, mod)`       |
| `Collection.remove(q)`           | `await Collection.removeAsync(q)`            |
| `Collection.upsert(q, mod)`      | `await Collection.upsertAsync(q, mod)`       |
| `Meteor.call('m', ...args, cb)`  | `await Meteor.callAsync('m', ...args)`       |
| `Meteor.user()` (server)         | `await Meteor.userAsync()`                   |
| `Accounts.createUser(opts, cb)`  | `await Accounts.createUserAsync(opts)`       |

See `references/async-cheatsheet.md` for the full table.

## Common errors and fixes

- `TypeError: Collection.findOne is not a function`: the server-side sync API
  was removed. Use `findOneAsync` and `await` the result.
- `Method returns undefined` or `Method returns a Promise`: the caller is not
  awaiting. Mark the caller `async` and `await` the call.
- `Publish function returned a Promise. This is not supported.`: the publish
  function is async and yields data out of order. Either keep the publish
  function synchronous (return a cursor), or use the low-level `added` /
  `changed` / `removed` API.
- `ReferenceError: Fiber is not defined`: a package or app file is still
  calling `Meteor._sleepForMs` or `Future.wrap`. Remove the Fibers-era code
  path; rewrite the function as async.

See `references/removed-functions.md` for the full removed-API list.

## Migration order

1. Run Meteor 2.16 or later first. The 2.x line introduced `*Async` siblings
   for every sync API, so most of the work can be done before the actual 3.x
   upgrade.
2. Audit Atmosphere packages. Replace anything that is not Meteor 3 compatible
   before bumping the framework. See `v3-docs/v3-migration-docs/guide/package-replacements.md`.
3. Upgrade to Meteor 3.x.
4. Sweep server code: replace every sync Mongo call.
5. Sweep `Meteor.call` callers: switch to `callAsync` and await.
6. Run the test suite. Tests catch most missed sites because the return values
   change from data to `Promise`.
7. Run the app. Server boot will fail loudly on any remaining Fibers-era code.

## Anti-patterns

- Do not mix `await` and `.then()` in the same method body. Pick one.
- Do not wrap sync code in `Promise.resolve()` to silence type errors. Fix
  the underlying signature instead.
- Do not call `Meteor.userId()` from arbitrary async contexts. Inside a
  method or publication, prefer `this.userId`. Outside, the user context is
  not reliable.
- Do not write a publication that awaits inside the cursor transform. Cursor
  transforms must be synchronous. Use the low-level publish API for
  async work.
- Do not migrate by global find-and-replace. Methods that returned `undefined`
  in 2.x because of `cb` callbacks return a `Promise` in 3.x; their callers
  often need rewriting, not just `await`.

## See also

- `references/call-vs-callAsync.md`
- `references/removed-functions.md`
- `references/async-cheatsheet.md`
- `references/eval-cases.md`
