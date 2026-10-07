# Logs and instrumentation

Read this reference when existing output cannot distinguish a runtime entry,
guard, branch, state transition, boundary, or event order.

## Add the smallest observation

| Question | Observation point |
|---|---|
| Did the flow start? | Handler, method, publication, job, or reactive entry |
| Why did it stop? | Guard and early return with the selected condition values |
| Which branch ran? | Branch name and values that select it |
| Where did the value change? | Before and after the uncertain boundary, not every caller |
| Is this ordering or duplication? | Opaque event ID, phase, counter, and timestamp only when time matters |

Keep diagnostics behavior-neutral. Reproduce and read them before editing the
logic.

```javascript
console.log("[server items.add] before insert", {
  requestId,
  hasUserId: Boolean(this.userId),
  itemId,
  quantity,
});
```

Select and redact fields. Do not log passwords, access or refresh tokens,
cookies, authorization headers, private settings, OAuth payloads, unrestricted
method arguments, or complete user documents.

Raw objects shown by browser tools can reflect later mutation. Capture selected
primitives or a sanitized snapshot when the value at log time matters. Do not
require `JSON.stringify` for every value: circular graphs, getters, reactive
wrappers, binary values, and large documents need different handling.

## Reactive and concurrent paths

- Guard or sample diagnostics inside `Tracker.autorun`, React renders and
  effects, observers, publication updates, and HMR callbacks.
- Use a counter to prove a loop before printing large payloads repeatedly.
- Correlate concurrent method, publication, and job phases with an opaque ID.
- Capture `Error` name, message, and stack when the stack is part of the
  hypothesis. Do not swallow or downgrade the original failure.

## Server lifecycle events (Meteor 3.6+)

For method/publication/DDP correlation, the optional server-only
`instrumentation` package exposes read-only lifecycle events. Earlier releases
retain explicit redacted boundary observations or the app's existing logger;
do not patch framework internals to imitate the API.

```javascript
// Server only, after adding the instrumentation package.
import { Instrumentation } from "meteor/instrumentation";

const handle = Instrumentation.on("method.end", (event) => {
  console.log("method completed", {
    name: event.name,
    traceId: event.traceId,
    durationMs: event.durationMs,
  });
});

// Stop when the diagnostic no longer has an owner.
handle.stop();
```

Select `method.start/end/error`, `publication.start/ready/stop/error`, or
`ddp.connection.open/close` for the uncertain boundary. Inside a method or
publication, `Instrumentation.currentContext()` supplies matching trace/span
and connection identifiers. Do not substitute generic timers for correlation.
The package emits events; it does not install an APM/OpenTelemetry backend.

Argument/result/client-address capture is off by default. Enable only approved
bounded/redacted observations if metadata cannot answer the question. Previews
are snapshots, not permission to log private data; official Accounts payloads
remain redacted. Stop the listener and remove temporary settings after the
reproduction. Do not mutate invocation objects or swallow the original error.

## Persistent structured logs

Use the application's established logger for maintained observability. Meteor's
standard package is available when the app adds `logging`:

```bash
meteor add logging
```

```javascript
import { Log } from "meteor/logging";

Log.info({
  message: "items.add completed",
  app: "SERVER",
  requestId,
  itemId,
});
```

`Log.debug` is not displayed in production. Do not depend on it for production
incident evidence. Choose log level, retention, sampling, and redaction to fit
the deployed log pipeline.

## Cleanup

Review the diff and remove only investigation diagnostics. Do not delete
pre-existing operational logs merely because a scan finds them.

```bash
rg -n 'console\.(log|debug|warn|error)|\bdebugger\b' \
  --glob '!node_modules/**' --glob '!.meteor/**'
```

Retain a diagnostic only when it has an operational owner, a safe schema, an
appropriate level, and a reason to exist after the fix.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/packages/logging.md
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/packages/instrumentation.md
