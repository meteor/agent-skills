# Sync-to-async rewrite mechanics

Meteor 3 removed the synchronous Mongo API on the server. Every callsite must
switch to the `*Async` sibling and `await` the result. The async-ness
propagates up the call stack until it hits a `Meteor.methods` handler, a
publish function, an `Express`-style middleware, or another framework
boundary that already supports async.

## Decision flow

1. Server-side code: rewrite sync Mongo to `*Async` and `await` the result.
2. Mark the containing function `async`.
3. Mark every caller `async`. Stop at the framework boundary.
4. Client-side Minimongo: leave sync calls alone. Switching client Mongo to
   async loses Tracker reactivity. See `client-reactivity.md`.
5. Inside a method or publication, prefer `this.userId` over
   `Meteor.userId()`. The async server context can lose the implicit user.

## Server rewrites

```javascript
const doc  = await Posts.findOneAsync(id);
const list = await Posts.find(q, { fields, sort, limit }).fetchAsync();
const _id  = await Posts.insertAsync(doc);
await Posts.updateAsync(q, mod);
await Posts.removeAsync(q);
await Posts.upsertAsync(q, mod);
```

Cursor methods on the server are async too:

```javascript
await cursor.forEachAsync(fn);
await cursor.mapAsync(fn);
await cursor.countAsync();
```

## Iterators with await

Naive `forEach` / `map` / `filter` callbacks marked `async` do not block the
iterator. See `js-iterators.md`.

## Fibers helpers

The Fibers-era helpers are gone:

| Removed                  | Replacement                                          |
|--------------------------|------------------------------------------------------|
| `Meteor._sleepForMs(ms)` | `await new Promise(r => setTimeout(r, ms))`          |
| `Meteor.wrapAsync(fn)`   | Call the underlying async API directly.              |
| `Promise.await(promise)` | `await promise`                                      |
| `Future` (`fibers/future`) | The package no longer ships. Refactor to async.    |

## Common errors

- `TypeError: Collection.findOne is not a function`: server-side sync API
  removed. Use `findOneAsync` and `await`.
- `Method returns undefined` or returns a `Promise`: the caller is not
  awaiting. Mark it `async` and `await` the call.
- `ReferenceError: Fiber is not defined`: a package or app file still
  references Fibers. Remove the dependency and rewrite the function.

## HTTP and timers

`HTTP.get`/`HTTP.post` are removed. Use native `fetch`:

```javascript
const res  = await fetch(url, { headers });
const data = await res.json();
```

`Meteor.defer(fn)` for fire-and-forget work survives, but for bulk fan-out
prefer `await Promise.all(items.map(processOne))`.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/migrating-to-async-in-v2/index.md
