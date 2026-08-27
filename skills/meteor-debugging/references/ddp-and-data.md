# DDP and data

Read this reference for missing or stale client data, subscription readiness,
reconnects, WebSocket or proxy symptoms, and Mongo versus Minimongo mismatches.

## Find the first divergence

Trace the same selected record or event through these boundaries:

```text
server query
-> publication output or low-level added/changed/removed
-> DDP connection and messages
-> subscription ready
-> Minimongo collection
-> reactive query
-> rendered UI
```

Do not skip from server Mongo directly to the UI. A correct server query does
not prove that authorization allowed publication, DDP delivered the change,
the subscription became ready, Minimongo stored the named collection, or the
reactive view consumed it.

| First divergence | Continue with |
|---|---|
| Query or modifier | `meteor-mongo-minimongo` |
| Publication selection, readiness, or low-level messages | `meteor-pubsub` |
| Method result or optimistic reconciliation | `meteor-methods` |
| Render after correct Minimongo state | `meteor-react` or `meteor-blaze` |
| Proxy, health, routing, or deployed WebSocket path | `meteor-deployment` |

## DDP and WebSocket evidence

In browser DevTools, inspect connection state and filter the Network panel by
WS. Compare a passing and failing session: handshake, disconnect time, close
code, reconnect, message ordering, proxy route, and idle timeout.

Meteor 3.5+ has a pluggable DDP transport. Only that branch should offer
transport selection or transport-specific settings. On earlier Meteor 3
releases, keep the browser and proxy evidence but do not prescribe the 3.5+
transport configuration.

A changed transport is not a generic reconnect fix. Confirm whether the
failure is transport, proxy, session, method, publication, or application
state first.

## Mongo and Minimongo inspection

Use the local shells for read-first evidence:

```bash
meteor mongo
meteor shell
```

Record the database, collection, selector, user or tenant scope, and relevant
field types. Inspect selected fields rather than dumping complete collections.
Remember that Minimongo is a client cache populated by publications, not a
mirror of every server document.

`meteor reset --db` deletes the local database. It is not diagnosis. Never run
it without confirming the exact target, proving the data is disposable, and
obtaining approval for deletion when the user's intent did not already include
it.

## Readiness

Do not use a delay or browser `networkidle` to infer subscription readiness.
Observe `sub.ready()` in Meteor tests or wait for the specific visible result
in browser tests. Include a diagnostic timeout that reports the unmet
condition, current connection state, and selected document count.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/performance/ddp-transport.md
