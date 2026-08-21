# Other breaking changes

Smaller breaking changes from the Meteor 3 upgrade that do not warrant
their own reference but still bite. Skim this once after the framework
flip; come back when a specific symptom matches.

## `Meteor.EnvironmentVariable.withValue` placement

Affects package authors that wrap `Meteor.publish`, `Meteor.methods`, or
other Meteor primitives in an `EnvironmentVariable.withValue` to propagate
a context value into the handler.

In Meteor 2.x, Fibers preserved the calling context across the
synchronous handler invocation, so a wrapper that called
`_publishConnectionId.withValue(this.connection.id, () => func.apply(this, args))`
**inside** the handler worked. In Meteor 3.x, the handler is async and
Fibers is gone. Wrapping must move to the **outer** scope so the value is
in scope when the framework registers the handler.

Wrong (Meteor 2.x pattern, broken on 3.x):

```javascript
function patchPublish(publish) {
  return function (name, func, ...args) {
    return publish.call(this, name, function (...args) {
      return _publishConnectionId.withValue(this?.connection?.id, () =>
        func.apply(this, args)
      );
    }, ...args);
  };
}
```

Right (Meteor 3 pattern):

```javascript
function patchPublish(publish) {
  return function (name, func, ...args) {
    return _publishConnectionId.withValue(this?.connection?.id, () => {
      return publish.call(this, name, function (...args) {
        return func.apply(this, args);
      }, ...args);
    });
  };
}
```

Symptom: the context value is `undefined` inside the handler at runtime,
even though the call site set it. The `universe:i18n` package adopted
this pattern for the 3.x upgrade.

## Mongo driver 6.x: callbacks removed on `rawCollection`

Meteor 3 ships MongoDB Node driver 6.x. The driver removed callback-style
overloads for every async operation. If your code drops to `rawCollection`
or `rawDatabase` for native driver access, rewrite the call sites:

```javascript
// Meteor 2.x: callback
Posts.rawCollection().findOne({ _id }, (err, doc) => { /* ... */ });

// Meteor 3.x: promise
const doc = await Posts.rawCollection().findOne({ _id });
```

The same applies to `rawCollection().aggregate(...).toArray(cb)`,
`insertOne(doc, cb)`, `bulkWrite(ops, cb)`, etc. If a third-party package
still passes a callback into a driver call, fork and rewrite.

## CLI changes

### `--vue2` flag removed

`meteor create --vue2` no longer exists. Vue 2 reached end of life in
December 2023. For Vue, use `meteor create --vue` (Vue 3).

### `meteor reset` no longer wipes Mongo by default

`meteor reset` now clears only the local build cache. The local MongoDB
data survives. To also wipe the database (the Meteor 2.x default), pass
`--db`:

```bash
meteor reset           # clears build cache only
meteor reset --db      # clears build cache AND local Mongo
```

Update any CI or development scripts that rely on `meteor reset` wiping
the database.

## Release-specific Node baseline

Meteor 3 does not have one Node baseline across every minor release:

| Meteor release | Bundled Node |
|----------------|--------------|
| 3.0 through 3.3 | Node 20     |
| 3.4             | Node 22     |
| 3.5             | Node 24     |

Run `meteor node --version` in the target app and use that version in CI,
native dependency builds, and container images. Audit `engines.node` and
native packages whenever the target Meteor release changes Node major.

## "Cannot enlarge memory array" during `meteor update`

Running `meteor update --release=3.x` directly from a heavy 2.x project
sometimes crashes with:

```
MINISAT-out: Cannot enlarge memory arrays.
abort() at Error
```

The version-constraint solver (`minisat`) runs out of memory while
resolving the upgrade against a large `.meteor/packages` file. The fix
is to reduce the package surface before the upgrade:

1. Remove every Atmosphere package the app no longer uses.
2. Update or fork remaining packages to declare
   `api.versionsFrom(['2.x', '3.0'])` so the solver has fewer
   alternatives to consider.
3. Retry the upgrade. If it still fails, comment out non-core packages
   in `.meteor/packages`, upgrade, then re-add them one by one.

This is the same root cause as "the install just hangs forever" reports.

## `Meteor.bindEnvironment` for external callbacks

Code that registers a callback with a non-Meteor library (a third-party
SDK, a raw Node stream, a global event emitter) loses Meteor context.
`this.userId`, `Meteor.user()`, `Meteor.EnvironmentVariable` values all
read as `undefined` inside the callback.

Wrap the callback with `Meteor.bindEnvironment`:

```javascript
import { Meteor } from 'meteor/meteor';

externalSdk.on('event', Meteor.bindEnvironment(async (payload) => {
  // Meteor context is restored here. this.userId / Meteor.user() work.
  await Posts.insertAsync({ payload, createdBy: Meteor.userId() });
}));
```

This is not new in Meteor 3, but it surfaces more often because async
code paths are everywhere. If a callback used to work and now doesn't,
suspect lost environment and reach for `bindEnvironment`.

## Monkey-patching from `Meteor.startup()`

Code that monkey-patches a Meteor API (intercepting `Meteor.publish`,
wrapping `Accounts.createUser`, etc.) must run after the API is loaded.
On 3.x, package load order is less forgiving than on 2.x; patches at the
top of a file may fire before the target API exists.

Wrap the patch in `Meteor.startup`:

```javascript
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  const original = Meteor.publish;
  Meteor.publish = function (name, handler, ...rest) {
    return original.call(this, name, async function (...args) {
      // patched behavior
      return handler.apply(this, args);
    }, ...rest);
  };
});
```

Symptom: the patch is in the codebase but the wrapped behavior never
runs. The patch fired before the target API loaded, so `Meteor.publish`
was `undefined` at patch time and the assignment was a no-op.

## NPM installer

The official Meteor install command is now `npx meteor` (a thin npm
wrapper that resolves the platform binary). The old `curl
https://install.meteor.com/ | sh` installer still works but is being
phased out. Use `npx meteor` in fresh-environment instructions and CI.

Run on Node 20 or newer, including in CI runners. Older Node versions
cannot resolve the wrapper.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/breaking-changes/index.md
