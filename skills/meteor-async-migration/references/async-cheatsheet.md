# Async cheatsheet

Quick lookup for the sync-to-async rewrite Meteor 3 requires on the server.

| Surface                | Sync (2.x, server)              | Async (3.x, server)                     |
|------------------------|---------------------------------|-----------------------------------------|
| Mongo read             | `c.find(q).fetch()`             | `await c.find(q).fetchAsync()`          |
| Mongo single read      | `c.findOne(q)`                  | `await c.findOneAsync(q)`               |
| Mongo write            | `c.insert(d)`                   | `await c.insertAsync(d)`                |
| Mongo update           | `c.update(q, m)`                | `await c.updateAsync(q, m)`             |
| Mongo delete           | `c.remove(q)`                   | `await c.removeAsync(q)`                |
| Mongo upsert           | `c.upsert(q, m)`                | `await c.upsertAsync(q, m)`             |
| Cursor enumeration     | `cursor.forEach(fn)`            | `await cursor.forEachAsync(fn)`         |
| Cursor count           | `cursor.count()`                | `await cursor.countAsync()`             |
| Cursor map             | `cursor.map(fn)`                | `await cursor.mapAsync(fn)`             |
| RPC                    | `Meteor.call('m', ...args, cb)` | `await Meteor.callAsync('m', ...args)`  |
| RPC with options       | `Meteor.apply(...)`             | `await Meteor.applyAsync(...)`          |
| User identity (server) | `Meteor.user()`                 | `await Meteor.userAsync()`              |
| Accounts create        | `Accounts.createUser(o, cb)`    | `await Accounts.createUserAsync(o)`     |
| Accounts password set  | `Accounts.setPassword(...)`     | `await Accounts.setPasswordAsync(...)`  |

Minimongo on the client keeps the synchronous API. None of these rewrites
apply to the client.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/migrating-to-async-in-v2/index.md
