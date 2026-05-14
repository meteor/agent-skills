# React migration

Tight scope: what changes for an existing React-on-Meteor-2 app during
the upgrade to Meteor 3. The broader React-on-Meteor data tutorial
(`react-meteor-data`, full hook reference, suspense patterns for new
apps) is out of scope here; a future `meteor-react-meteor-data` skill
will cover it.

## What changes

`react-meteor-data` gained a Suspense-aware import path in Meteor 3.
The Suspense variants short-circuit the `isLoading` boolean by
suspending the component tree until data is ready.

```javascript
// Meteor 2.x: imperative
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';

function Posts() {
  const isLoading = useSubscribe('posts');
  const posts     = useTracker(() => Posts.find().fetch());
  if (isLoading()) return <Spinner />;
  return <List posts={posts} />;
}
```

```javascript
// Meteor 3.x: suspense-aware
import { useTracker, useSubscribe } from 'meteor/react-meteor-data/suspense';

function Posts() {
  useSubscribe('posts');                                  // suspends
  const posts = useTracker('posts', () => Posts.find().fetch()); // key + fn
  return <List posts={posts} />;                          // no isLoading()
}
```

Two concrete changes:

1. Import from `meteor/react-meteor-data/suspense` instead of
   `meteor/react-meteor-data` when you want Suspense semantics. Wrap the
   component in `<Suspense fallback={...}>` somewhere upstream.
2. `useTracker(key, fn)` takes a string key as the first argument under
   the suspense API. The key isolates the computation; passing the same
   key with a different `fn` is undefined.

The classic `useTracker(fn)` and `useSubscribe(...)` (returning
`isLoading`) keep working under the non-suspense import path. Migration
is optional.

## `useFind`

`useFind` is unchanged. Continue passing a cursor factory:

```javascript
const posts = useFind(() => Posts.find({}));
```

## Client-side Mongo

React components that call `Collection.find().fetch()` directly on the
client work the same way as in Meteor 2. Minimongo on the client is still
synchronous. Do not rewrite client-side reads to `*Async`; that loses
Tracker reactivity. See `client-reactivity.md`.

## Symptoms

- After the upgrade, a `useSubscribe` call no longer returns an
  `isLoading` function. The component was migrated to the suspense
  import without a wrapping `<Suspense>`. Either add a Suspense
  boundary, or import from `meteor/react-meteor-data` (non-suspense).
- `useTracker` reruns on every render or never reruns. The key argument
  is missing under the suspense API. Add a stable string key.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/front-end/react.md
