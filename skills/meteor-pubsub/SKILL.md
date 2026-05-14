---
name: meteor-pubsub
description: >
  Use when authoring or debugging Meteor publications and subscriptions
  (Meteor.publish, Meteor.subscribe). Triggers on publication strategies
  (SERVER_MERGE, NO_MERGE, NO_MERGE_NO_HISTORY), the low-level publish API
  (added/changed/removed), cursor authorization, reactive joins, leaked
  documents. Use this skill when the user asks about pub/sub or asks about
  reactive data fetching.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: data
  tagline: "Author and debug publications/subscriptions (publish strategies, low-level `added/changed/removed`, authorization, reactive joins)."
  bundle: ["essentials", "fullstack"]
  docs_synced_at: "2026-05-14"
license: MIT
---

# Meteor publications and subscriptions

Publications stream a set of documents to subscribed clients and keep them
live. The publication is the only place server-side authorization can
filter rows before they reach the client.

## Decision flow

1. Does the client need this data reactively? If no, prefer a method (one-shot
   read). If yes, use a publication.
2. Is the data user-specific? Filter by `this.userId` inside the publish
   function. Without that filter, documents leak across users.
3. Can the publication be expressed as a single cursor? Return it directly.
4. Does the publication need to join data, run aggregations, or react to
   external sources? Drop to the low-level `this.added` / `this.changed` /
   `this.removed` API.

## Scaffold

```javascript
import { Meteor } from "meteor/meteor";
import { Items } from "/imports/api/items";

Meteor.publish("items.mine", function () {
  if (!this.userId) {
    return this.ready();
  }
  return Items.find(
    { ownerId: this.userId },
    { fields: { title: 1, qty: 1, updatedAt: 1 }, sort: { updatedAt: -1 } },
  );
});
```

Always project (`fields`). Returning the whole document leaks columns.

## Subscribing

```javascript
import { Meteor } from "meteor/meteor";

const handle = Meteor.subscribe("items.mine");
// React / Blaze / Svelte hooks observe handle.ready() and the local cursor.
handle.stop();
```

## Publication strategies

Set per-collection with `Meteor.server.setPublicationStrategy`. Three options:

```javascript
import { DDPServer } from "meteor/ddp-server";

Meteor.server.setPublicationStrategy(
  "items",
  DDPServer.publicationStrategies.NO_MERGE,
);
```

| Strategy             | When to use                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `SERVER_MERGE`       | Default. Server tracks per-client cursor state. Highest server memory cost. |
| `NO_MERGE`           | Stateless. Server sends the full result on every change. Lower memory, more bandwidth. |
| `NO_MERGE_NO_HISTORY`| Stateless and skips history. Use for read-only, append-only feeds.          |

See `references/publication-strategies.md`.

## Low-level publish API

For joins or async work:

```javascript
Meteor.publish("feed", async function () {
  const cursor = Posts.find({}, { fields: { title: 1, authorId: 1 } });
  const observer = await cursor.observeChangesAsync({
    added: async (id, doc) => {
      const author = await Users.findOneAsync(doc.authorId, {
        fields: { username: 1 },
      });
      this.added("feed", id, { ...doc, authorName: author?.username });
    },
    changed: (id, changes) => this.changed("feed", id, changes),
    removed: (id) => this.removed("feed", id),
  });

  this.ready();
  this.onStop(() => observer.stop());
});
```

Note: cursor `transform` functions remain synchronous. Any async join
must use the low-level API.

## Anti-patterns

- Publish without a `this.userId` filter when data is user-specific.
- Publish without `fields` projection. Always project.
- Return a Promise from `Meteor.publish`. Publications expect a cursor, an
  array of cursors, or use of the low-level API.
- Use cursor transforms for async joins. Transforms are synchronous; the
  low-level API is the right tool.
- Subscribe to large unbounded collections. Page the data with `limit`/`skip`.

## See also

- `references/publication-strategies.md`
- `references/low-level-publish-api.md`
- `references/eval-cases.md`
