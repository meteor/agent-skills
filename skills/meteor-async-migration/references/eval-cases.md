# Evaluation cases for `meteor-async-migration`

A human runs these prompts against Claude Code and Cursor with the skill
installed (`npx skills add ./ --skill meteor-async-migration`) and verifies the
agent loads the skill and produces the expected output.

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

Expected behavior:
- Agent loads `meteor-async-migration` (mentions it by name or cites a trigger
  phrase).
- Agent suggests `await Posts.find({ published: true }).fetchAsync()`.
- Agent marks the method async.

Pass if both code changes are proposed in the first turn.

## Case 2: Meteor.call replacement

Prompt:

```
Rewrite this client code for Meteor 3:

  Meteor.call('addItem', payload, (err, res) => {
    if (err) return console.error(err);
    setItem(res);
  });
```

Expected behavior:
- Agent rewrites to `Meteor.callAsync` with `try { ... } catch (err) { ... }`.
- Agent marks the surrounding function `async`.
- Agent preserves the optimistic UI shape if the stub exists.

Pass if the new code uses `await Meteor.callAsync('addItem', payload)`.

## Case 3: async cursor transform

Prompt:

```
My publication started returning a "publish function returned a Promise"
error after the upgrade:

  Meteor.publish('feed', function () {
    return Posts.find({}, { transform: async (doc) => {
      doc.author = await Users.findOneAsync(doc.authorId);
      return doc;
    }});
  });
```

Expected behavior:
- Agent identifies that cursor transforms must be synchronous.
- Agent proposes either: refactor to a synchronous transform with a separate
  publication for users, or rewrite using the low-level publish API
  (`this.added` / `this.changed` / `this.removed`).

Pass if the agent calls out the synchronous-transform constraint.

## Case 4: Fibers helper

Prompt:

```
This breaks on Meteor 3:

  Meteor.methods({
    delay() {
      Meteor._sleepForMs(1000);
    },
  });

Fix it.
```

Expected behavior:
- Agent replaces `Meteor._sleepForMs(1000)` with
  `await new Promise(r => setTimeout(r, 1000))`.
- Agent marks the method async.

Pass if both rewrites land in the first turn.
