# Publication strategies

## `SERVER_MERGE` (default)

The server maintains a per-client view of every published document and only
sends diffs. Highest memory cost; lowest bandwidth. Right for typical apps
where the working set per client is small.

## `NO_MERGE`

The server sends the full result of every reactive run. No per-client state.
Lower memory; higher bandwidth. Use for read-only feeds or when memory
pressure is real.

## `NO_MERGE_NO_HISTORY`

Like `NO_MERGE`, but the server forgets which documents it sent. Documents
already at the client are sent again on every change. Use only for
append-only, write-once data.

## Setting the strategy

Strategies are set per collection name, not per publication.

```javascript
import { DDPServer } from "meteor/ddp-server";

Meteor.server.setPublicationStrategy(
  "feed",
  DDPServer.publicationStrategies.NO_MERGE,
);

// Read it back
Meteor.server.getPublicationStrategy("feed");
```

## Choosing

- Default app (collaborative editor, dashboards): `SERVER_MERGE`.
- High-fanout feed (notifications, activity stream): `NO_MERGE`.
- Append-only log shipped to many clients: `NO_MERGE_NO_HISTORY`.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/api/meteor.md#publication-strategies
