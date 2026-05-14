---
name: meteor-mongo-minimongo
description: >
  Use when authoring or debugging Mongo queries in Meteor 3. Triggers on
  Mongo.Collection, find/findOne, server async vs client Minimongo sync,
  oplog vs change streams, indexes, selectors, modifiers, projections.
  Use this skill when the user asks about Mongo on the server or asks about
  Minimongo on the client.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: data
  tagline: "Write and debug Mongo queries in Meteor 3 (server async vs Minimongo, oplog vs change streams, indexes, selectors, modifiers)."
  bundle: ["essentials"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Mongo and Minimongo

Meteor ships two implementations of the Mongo API in one codebase. The server
talks to MongoDB through an async driver. The client runs Minimongo, an
in-memory synchronous Mongo emulator that holds the documents that
subscriptions have shipped.

## Decision flow

1. Where does this code run?
   - Server-only: use `await Collection.*Async(...)`.
   - Client-only: use `Collection.*(...)` synchronously.
   - Isomorphic (`import` in shared code): use `await Collection.*Async(...)`.
     On the client it resolves synchronously; on the server it talks to Mongo.
2. Does the query select more than a page of documents? Add `{ limit, skip }`
   and an index that matches the selector.
3. Are you reading from a publication on the client? Use `find().fetch()`
   (sync) without `await`. The data is already local.

## Server reads

```javascript
const doc  = await Posts.findOneAsync(id);
const list = await Posts.find({ ownerId }, {
  fields: { title: 1 }, sort: { createdAt: -1 }, limit: 50,
}).fetchAsync();
const count = await Posts.find({ ownerId }).countAsync();
```

## Server writes

```javascript
const _id = await Posts.insertAsync({ title, ownerId });
await Posts.updateAsync({ _id }, { $set: { title } });
await Posts.removeAsync({ _id });
```

## Client reads (Minimongo)

The async API is isomorphic. Prefer it in shared code so the same line works
on the server.

```javascript
const doc = await Posts.findOneAsync(id);                 // works in shared/client/server
const list = await Posts.find({ ownerId }).fetchAsync();
```

On the client, the Promise resolves synchronously because Minimongo is
in-memory. The sync API also works client-side, but only there:

```javascript
const doc = Posts.findOne(id);                            // client-only
const list = Posts.find({ ownerId }).fetch();             // client-only
```

Pick sync when the calling scope is naturally sync and forcing `await`
would cascade async into a render path. Common cases:

- React render functions and hooks that consume reactive data.
- Blaze template helpers.
- Tracker autoruns.

Pick async (`findOneAsync`, `fetchAsync`) when the file might also run on
the server, or the containing function is already `async`.

## Indexes

Indexes are server-side. Create them on app startup:

```javascript
import { Meteor } from "meteor/meteor";
import { Posts } from "/imports/api/posts";

Meteor.startup(async () => {
  await Posts.createIndexAsync({ ownerId: 1, createdAt: -1 });
  await Posts.createIndexAsync({ slug: 1 }, { unique: true });
});
```

The selector order in the query must match the index order. To verify, drop
into the Mongo shell (`meteor mongo`) and run
`db.posts.find(...).explain("executionStats")`.

## Reactivity source: oplog or change streams

Meteor's reactivity engine on the server can ride the Mongo replica oplog
(the default for self-hosted Mongo) or change streams (Atlas, Mongo 5+). The
choice is driven by your `MONGO_OPLOG_URL` env var or `MONGO_URL` shape.
See `v3-docs/docs/api/collections.md#mongo-connection-options`.

## Anti-patterns

- Use sync Mongo on the server. Removed in Meteor 3.
- Use sync Mongo (`findOne`, `insert`, `update`, `remove`) in shared code.
  Breaks the moment the file is imported on the server.
- Unbounded `find` on the server. Always `limit`.
- Forget `fields` projection when publishing. Always project.

## See also

- `references/server-vs-client.md`
- `references/selectors-modifiers.md`
- `references/eval-cases.md`
