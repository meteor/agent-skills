# Low-level publish API

When a publish function needs to join, transform asynchronously, or react to
external sources, return nothing and drive the publication imperatively.

## Methods on `this`

- `this.added(collectionName, id, fields)`: announce a document.
- `this.changed(collectionName, id, fields)`: update fields.
- `this.removed(collectionName, id)`: drop a document.
- `this.ready()`: signal initial population complete.
- `this.onStop(fn)`: register a teardown.
- `this.error(err)`: send a non-fatal error.
- `this.stop()`: end the subscription.
- `this.userId`, `this.connection`: identity.

## Pattern

```javascript
Meteor.publish("feed", async function () {
  const handle = await Posts.find().observeChangesAsync({
    added:   (id, doc) => this.added("posts", id, doc),
    changed: (id, doc) => this.changed("posts", id, doc),
    removed: (id) => this.removed("posts", id),
  });
  this.ready();
  this.onStop(() => handle.stop());
});
```

Always pair `observeChangesAsync` with `onStop`. Leaks otherwise.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/api/meteor.md#publish-and-subscribe
