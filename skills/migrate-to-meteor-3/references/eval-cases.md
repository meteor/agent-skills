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
After migrating this Blaze helper, the page renders once and never updates
when the underlying user document changes:

  async user() {
    await Meteor.callAsync('profiles.prepare', this.userId);
    return Meteor.users.findOneAsync(this.userId);
  }
```

Pass if the agent explains that client Minimongo supports both sync and async
APIs, and that the query loses the computation because it runs after the first
`await`. Accept either simplifying the helper to synchronous Minimongo when
the preparation step is unnecessary, or wrapping the later query with
`Tracker.withComputation`. Fail if it claims all async Minimongo queries are
nonreactive.

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

## Case 8: async propagation through callers

Prompt:

```javascript
function findOrder(id) {
  return Orders.findOne(id);
}

function calculateTotal(id) {
  return findOrder(id).total;
}

function buildInvoice(id) {
  return { total: calculateTotal(id) };
}

Meteor.methods({
  createInvoice(id) {
    return buildInvoice(id);
  },
});
```

"Migrate this call chain to Meteor 3. Do not change only the Mongo call."

Pass if the agent traces the complete caller chain, replaces `findOne` with
`findOneAsync`, awaits the result before reading `.total`, propagates Promise
handling through `buildInvoice`, and stops at the method boundary. Accept
direct Promise forwarding where no resolved value is consumed. Fail if any
caller still treats a Promise as the resolved value.

## Case 9: synchronous constructor boundary

Prompt:

```javascript
class Invoice {
  constructor(orderId) {
    this.order = Orders.findOne(orderId);
  }
}
```

"Migrate this class to Meteor 3 while preserving construction correctness."

Pass if the agent does not mark the constructor async. It must introduce an
async factory or require a preloaded order, await `findOneAsync` outside the
constructor, and keep object construction synchronous.
