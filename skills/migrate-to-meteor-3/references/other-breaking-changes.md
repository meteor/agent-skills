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

## Node v22 baseline

Meteor 3 runs on Node 22. Dependencies that pinned to Node 14 or 16 must
be upgraded or replaced. Audit `package.json` for any `engines.node`
constraint and any package whose latest release pre-dates Node 18 active
support.

## NPM installer

The official Meteor install command is now `npx meteor` (a thin npm
wrapper that resolves the platform binary). The old `curl
https://install.meteor.com/ | sh` installer still works but is being
phased out. Use `npx meteor` in fresh-environment instructions and CI.

Run on Node 20 or newer, including in CI runners. Older Node versions
cannot resolve the wrapper.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/breaking-changes/index.md
