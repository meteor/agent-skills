# Evaluation cases for `migrate-to-meteor-3`

A human runs these prompts against Claude Code and Cursor with the skill
installed and verifies the agent loads the skill and produces the expected
output.

## Case 1: missing await on server-side find

Prompt:

```
I just upgraded to Meteor 3. This method returns undefined on the server,
but it worked in 2.x:

  Meteor.methods({
    listPosts() {
      return Posts.find({ published: true }).fetch();
    },
  });

What did I miss?
```

Pass if the agent suggests `await Posts.find(...).fetchAsync()` and marks
the method `async`. Bonus pass if the agent points at
`references/async-rewrites.md`.

## Case 2: implicit global ReferenceError

Prompt:

```
After updating to Meteor 3 my server crashes on boot with
ReferenceError: PostsShowController is not defined. The file that defines
it just has `PostsShowController = RouteController.extend({...})` at the top.
```

Pass if the agent identifies the implicit-global pattern, suggests
`const PostsShowController = ...` (or `export`), and points at
`references/module-system.md`.

## Case 3: Iron Router silent failure

Prompt:

```
Some of my Iron Router routes load the template but the data is missing.
No errors. The publication never starts. I'm on Meteor 3.
```

Pass if the agent identifies the controller naming-convention lookup
breakage and suggests adding `controller: <Name>` explicitly to the
route definition.

## Case 4: lost reactivity after async helper rewrite

Prompt:

```
After migrating my Blaze helpers to async, the page renders once and never
updates when the underlying user document changes. Worked in Meteor 2.
```

Pass if the agent identifies that `findOneAsync` does not set up Tracker
dependencies and recommends keeping sync minimongo on the client inside
helpers, or `Tracker.withComputation` for genuinely async helpers.

## Case 5: forEach with await skips items

Prompt:

```
This loop runs but my insertedIds is empty afterwards:

  const insertedIds = [];
  items.forEach(async (item) => {
    const id = await Items.insertAsync(item);
    insertedIds.push(id);
  });
  return insertedIds;
```

Pass if the agent identifies that `forEach` does not await the callback,
and rewrites to `for...of` or `Promise.all`.

## Case 6: cursor transform errors out

Prompt:

```
My publication errors with "publish function returned a Promise":

  Meteor.publish('feed', function () {
    return Posts.find({}, { transform: async (doc) => {
      doc.author = await Users.findOneAsync(doc.authorId);
      return doc;
    }});
  });
```

Pass if the agent calls out that cursor `transform` must be synchronous
and proposes either a separate publication for users or the low-level
publish API.

## Case 7: Atmosphere package fails to resolve

Prompt:

```
After `meteor update --release=3` my build fails because
old-atmosphere-package needs api.versionsFrom('1.5') and there is no
3.x-compatible version on Packosphere.
```

Pass if the agent walks through the triage matrix (replace, fork, remove)
and describes how to fork minimally, update `api.versionsFrom`, and link
from `lib/` into `packages/`.
