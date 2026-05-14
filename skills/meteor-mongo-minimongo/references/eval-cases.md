# Evaluation cases for `meteor-mongo-minimongo`

## Case 1: server-side find rewrite

Prompt: "This used to work in Meteor 2 on the server:

```
const post = Posts.findOne({ slug });
```

Now it returns undefined. Fix it."

Pass if the agent rewrites to `await Posts.findOneAsync({ slug })` and marks
the caller async.

## Case 2: missing index

Prompt: "My `Posts.find({ ownerId, archived: false }, { sort: { createdAt:
-1 } })` query is slow. Suggest an index."

Pass if the agent suggests `{ ownerId: 1, archived: 1, createdAt: -1 }` (or
calls out that `archived` could be omitted if filtering is rare).

## Case 3: Minimongo on client

Prompt: "My component is client-only. Which Mongo API should I use:
`Posts.findOne(id)` or `await Posts.findOneAsync(id)`?"

Pass if the agent says both work on the client and picks based on the
calling scope:

- Async (`findOneAsync`) when the file might ever be imported in
  shared/server code, or the containing function is already async.
- Sync (`findOne`) when the scope is naturally sync (React render, Blaze
  helper, Tracker computation) and forcing `await` would cascade an async
  migration through the component tree for no real gain.

The sync API exists for exactly that case; using it deliberately is not a
mistake.

## Case 4: leaking columns

Prompt: "My subscription includes the `passwordHash` field. I never wanted
that to reach the client. What did I do wrong?"

Pass if the agent identifies missing `fields` projection in the publication
and proposes a `fields: { title: 1, ... }` allow-list.
