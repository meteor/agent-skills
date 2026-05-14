# `Meteor.call` vs `Meteor.callAsync`

In Meteor 2.x, `Meteor.call('name', ...args, callback)` was the canonical client
invocation. In Meteor 3.x, prefer `Meteor.callAsync('name', ...args)`, which
returns a `Promise`.

## Client-side rewrites

| 2.x                                              | 3.x                                                  |
|--------------------------------------------------|------------------------------------------------------|
| `Meteor.call('m', a, b, (err, res) => ...)`      | `try { const res = await Meteor.callAsync('m', a, b) } catch (err) { ... }` |
| `Meteor.call('m', a, b)` (fire-and-forget)       | `Meteor.callAsync('m', a, b).catch(console.error)`   |
| `Meteor.apply('m', args, opts, cb)`              | `await Meteor.applyAsync('m', args, opts)`           |

## Server-side rewrites

On the server, `Meteor.call` runs inline (no DDP round trip). Use `callAsync`
for consistency and to make the call site `await`-able.

## Optimistic UI

`callAsync` participates in latency compensation the same way `call` did. If
the method has a client-side stub, the stub runs immediately and the local
collection writes are visible before the server round trip resolves.

## Error shape

`callAsync` rejects with `Meteor.Error`. Catch and inspect `.error`, `.reason`,
and `.details`. The error shape did not change in 3.x.

## When to keep `Meteor.call`

Only when interoperating with a library that requires a callback. New code
should always use `callAsync`.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/breaking-changes/call-x-callAsync.md
