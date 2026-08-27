# `jam:offline`

Use `jam:offline` to persist selected Minimongo data in IndexedDB and replay
method work after reconnect. Read the [Meteor guide](https://docs.meteor.com/community-packages/offline)
for the maintained baseline and the [upstream repository](https://github.com/jamauro/offline)
for the current release, complete API, and issues.

## Baseline

- The Meteor guide states no Meteor release floor. Verify the current package
  release before adoption.
- Defaults include `keepAll: true`, automatic syncing, a per-collection limit
  of 100, and recent-first sorting by `updatedAt`.
- `.keep(filter, { sort, limit })` narrows persisted records for one collection.
  `Collection.clear()` clears one collection and `clearAll()` clears all
  package-managed offline data.
- Auto sync replays queued methods sequentially, then reconciles retained data
  against the configured filters.

```bash
meteor add jam:offline
```

```javascript
import { Offline } from "meteor/jam:offline";

Offline.configure({
  keepAll: false,
  autoSync: true,
  handleSyncErrors({ replayErrors, keepErrors }) {
    reportOfflineErrors({ replayErrors, keepErrors });
  },
});

Todos.keep(
  { ownerId: Meteor.userId() },
  { sort: { updatedAt: -1 }, limit: 50 },
);
```

## Replay and reconciliation

- For manual queuing, use `queueMethod(name, ...args)` and call the method with
  `noRetry: true` so Meteor's retry and the package replay do not compete.
- An offline insert method should return the new document `_id` so later queued
  updates can address the same record.
- `jam:method` integrates with offline queuing automatically.
- Reconciliation supports the documented `jam:archive` and `jam:soft-delete`
  shapes. Configure custom archive or deletion fields explicitly.
- `isSyncing()` is reactive. Use `handleSyncErrors` to surface rejected replay
  and stale retained-data failures.
- A service worker is separate. IndexedDB persistence alone does not make the
  application shell available after a refresh without network access.

## Required checks

- Verify the current `jam:offline` release before selecting its configuration
  or replay APIs because the Meteor guide states no release floor.
- Treat IndexedDB as user-readable device storage. Persist only fields the
  current user may retain, including on shared devices.
- Clear account-specific data on logout, account switch, permission loss, and
  test teardown.
- Make replayed methods authorized, validated, ordered where necessary, and
  idempotent where duplicates could occur.
- Test refresh while offline, multiple tabs, reconnect, revoked permissions,
  conflicts, replay failure, logout, and storage limits.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/community-packages/offline.md
