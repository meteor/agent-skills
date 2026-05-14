# Client reactivity inside async code

In Meteor 2.x, `Collection.findOne` on the client was synchronous and
reactive. Inside a Blaze helper or `Tracker.autorun`, calling it registered
a dependency that re-ran the computation when the underlying data changed.

In Meteor 3.x the sync minimongo API still exists on the client, but the
`*Async` siblings (`findOneAsync`, `fetchAsync`) return Promises. Tracker
cannot follow a Promise. Any async query inside a reactive computation
loses reactivity past the first `await`.

## The trap

```javascript
// BROKEN: not reactive. The view never updates when user docs change.
Template.profile.helpers({
  user() {
    return Meteor.users.findOneAsync(this.userId);
  },
});
```

The helper returns a Promise. Blaze unwraps it the first time, but
subsequent changes to the user document do not re-run the helper.

## The rule

On the **server**, always use the `*Async` API. On the **client**, inside
any reactive context (`Blaze` helper, `Tracker.autorun`, `Tracker.Dependency`,
`ReactiveVar` consumers), keep using the **sync** minimongo API. The sync
methods are deprecated but functional and they are the only path to
Tracker dependencies.

```javascript
// WORKS: sync minimongo on the client, reactive.
Template.profile.helpers({
  user() {
    return Meteor.users.findOne(this.userId);
  },
});
```

## Async helpers that need reactivity

If the helper must do async work (an external call, an awaited method),
restore reactivity manually with `Tracker.withComputation`:

```javascript
import { Tracker } from 'meteor/tracker';

Template.profile.helpers({
  enriched() {
    const computation = Tracker.currentComputation;
    return Tracker.withComputation(computation, async () => {
      const doc  = Meteor.users.findOne(this.userId); // first read, reactive
      const more = await Meteor.callAsync('users.enrich', this.userId);
      return { ...doc, ...more };
    });
  },
});
```

Reactivity is preserved through the first `await`. Any reactive reads after
that need `Tracker.withComputation` to be tracked.

## Blaze async helpers (Blaze 2.7+)

Blaze 2.7+ understands Promises returned by helpers and exposes three
state directives inside `{{#let}}`:

- `@resolved "<name>"`: true once the named `let` binding has settled.
- `@pending "<name>"`: true while the named `let` binding is still
  awaiting.
- `@rejected "<name>"`: true if the named `let` binding threw or its
  Promise rejected.

```handlebars
{{#let user=getUserAsync}}
  {{#if @pending "user"}}<Spinner />{{/if}}
  {{#if @rejected "user"}}<Error msg="Could not load user" />{{/if}}
  {{#if @resolved "user"}}
    {{> profile data=user}}
  {{/if}}
{{/let}}
```

This gives the same surface as React Suspense: a spinner during the
await, an error region on rejection, the resolved value once ready.

## Async iteration in Blaze

`{{#each}}` accepts an async helper that returns a Promise of an array
or cursor. Pair it with `{{else}}` for an empty-state branch:

```handlebars
{{#each user in getUsersAsync}}
  {{> userRow user=user}}
{{else}}
  <p>No users yet.</p>
{{/each}}
```

The minimum Blaze version for these directives is 2.7. If your project
pins an older Blaze, upgrade `blaze-html-templates` and the
`blaze` runtime packages before relying on `@pending`/`@rejected`.

## Symptoms

- Page renders correctly on initial load. Subsequent changes to the data
  never appear. Reactive helpers were rewritten to use async Mongo.
- A Blaze partial logs `[object Promise]` instead of the value. The helper
  returned a Promise without `@resolved` gating.
- `Tracker.autorun` runs once. Subsequent invalidations are silent. The
  autorun body awaited something.

## Two-phase data patterns

When a publication ships a base document and a second subscription
enriches it, the enrichment runs in a separate `Tracker.autorun`. Keep
both reads sync (minimongo) inside the helper. Use the explicit
`Meteor.subscribe` handle and `subscription.ready()` to gate rendering.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/front-end/blaze.md
