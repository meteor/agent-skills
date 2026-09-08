# Meteor 3.5.2 testing boundaries

## Rspack full-app tests

Meteor 3.5.2 pairs `rspack@1.3.0` and `@meteorjs/rspack@2.2.0`. Its full-app
fixes preserve configured `meteor.mainModule` client and server bundles even
when `meteor.testModule` defines only server tests:

```bash
meteor test --full-app --once --driver-package meteortesting:mocha
```

The server module graph can use top-level `await`; awaited module dependencies
settle before their consumers and app tests run. Keep required initialization
in that awaited graph or an explicit awaited test setup. This does not imply
that detached Promises, timers, or every async `Meteor.startup` callback under
every driver finish before tests. Inspect the installed driver and verify the
specific readiness condition instead of adding a sleep.

A built client application bundle does not mean client tests executed. Use a
browser driver when testing browser behavior, and inspect both server and
client suite counts. Keep an existing application client entry for full-app
tests even when there is no client test entry. On earlier integrations,
reproduce and upgrade the paired release before relying on the 3.5.2 fixes.

## Zero tests under a parent `private` directory

`@meteorjs/rspack@2.2.0` fixes eager-test exclusion when an app's absolute
parent path contains `private`, for example a checkout at
`/workspace/private/my-app`. That parent segment is not the application's
private-assets folder. Earlier versions can silently discover zero tests there.
Check the app-relative filename pattern, `meteor.testModule`, ignore rules,
and expected suite count. Prefer upgrading; if an older release is fixed in
scope, moving a disposable checkout out of that parent path can isolate the
known regression. Do not remove the actual app `private/` asset exclusion.

## Package tests requiring jQuery

`test-in-browser@1.6.0`, shipped with Meteor 3.5.2, removes transitive jQuery.
Inspect the resolved package independently of the Meteor release. If package
tests use jQuery, declare it in the existing `Package.onTest` callback:

```javascript
Package.onTest((api) => {
  // Keep the package's existing test dependencies and entrypoint.
  api.use("jquery", "client");
});
```

Or supply it for the test invocation:

```bash
meteor test-packages --extra-packages=jquery ./packages/my-package
```

Use the actual local package path. Older test-in-browser versions may supply
jQuery transitively, but explicit test dependencies are more reproducible.
Do not add jQuery to a production application or to tests that do not use it.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/about/modern-build-stack/rspack-bundler-integration.md
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/packages/7.writing-atmosphere-packages.md
