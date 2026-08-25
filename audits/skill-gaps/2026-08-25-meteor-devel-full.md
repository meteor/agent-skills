# Meteor devel full skill-gap audit, 2026-08-25

This record is the first reliable full baseline for future incremental audits. It freezes the reviewed revisions, source coverage, distributable claim matrix, and maintenance handoff. It records evidence only and does not modify published skills.

## Audit identity

- Agent-skills revision: `875f5399ee9474c3b8e0011985909ef038f4e5ab`
- Agent-skills worktree: dirty, with the unrelated untracked file `PLAN-07.md` only
- Pre-maintenance agent-skills revision: `839c2110c4ac00db31e450c0f7503930bd3c4938`
- Meteor remote: `https://github.com/meteor/meteor.git`
- Meteor branch: `devel`
- Meteor revision: `5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe`
- Meteor worktree: dirty from untracked files only; no tracked source changes entered the audit
- Meteor release context: `devel` snapshot; `v3-docs/docs/metadata.json` identifies 3.5.1 as the current release; this is not a release audit
- Audit mode: full
- Previous audit report: none
- Previous Meteor revision: none
- Comparison range: not applicable; first reliable baseline
- Audit date: 2026-08-25

## Scope and method

The audit reviewed every distributable file under all 12 published skill folders, including every `SKILL.md`, reference, script, asset, and evaluation case. It compared 150 evaluation cases and their associated factual claims with the frozen Meteor source and documentation revisions. It also checked the external repositories used by the React, Blaze, and testing skills.

The audit classifies a claim as:

| Verdict | Meaning |
|---|---|
| Covered | Current sources support the guidance and its routing is sufficient. |
| Partial | The guidance is useful but misses a material condition, failure mode, or evaluation. |
| Outdated | Current sources contradict a factual claim or example. |
| Overlap | Multiple skills own the same outcome without a clear routing boundary. |
| Candidate | A coherent Meteor-specific outcome is not owned by a published skill. |
| Documentation only | Upstream documentation needs correction, but the skills already avoid or correct the problem. |
| Uncertain | Evidence supports more investigation, not published maintenance. |

Counts below describe maintenance findings, not individual rows in the claim matrix:

| Classification | Count | Priority profile |
|---|---:|---|
| Outdated | 6 | 3 P1, 1 P2, 2 P3 |
| Partial | 2 | 2 P2 |
| Overlap | 0 | None |
| Candidate | 4 | 1 P2, 3 P3 |
| Documentation only | 2 | Upstream follow-up |
| Uncertain | 1 | Re-audit after more evidence |

## Source coverage

### Frozen primary sources

- Meteor documentation and core source: [`meteor/meteor@5cafdbc`](https://github.com/meteor/meteor/tree/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe)
- React integration source: [`meteor/react-packages@a2dbe22`](https://github.com/meteor/react-packages/tree/a2dbe228957fc4225b76e9206386861b49b1527b)
- Blaze source: [`meteor/blaze@e700f2d`](https://github.com/meteor/blaze/tree/e700f2d749ed037afae14dc3f055b9e52d5de375)
- Server test driver: [`meteortesting/meteor-mocha@f1815f5`](https://github.com/meteortesting/meteor-mocha/tree/f1815f5cf035ad4e0f31e7ef1e2c179169888b1b)
- Browser test driver: [`Meteor-Community-Packages/meteor-browser-tests@b88bfb7`](https://github.com/Meteor-Community-Packages/meteor-browser-tests/tree/b88bfb72822ce3d67aa2726c7c14f27a8f37fcb4)
- MongoDB compound index behavior: [Compound Indexes](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/) and [ESR Guideline](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/)

### Meteor documentation domains reviewed

The review included the complete current `v3-docs` tree and the migration guides relevant to published claims. The most important paths were:

| Domain | Primary paths |
|---|---|
| Accounts and security | `docs/packages/accounts.md`, `docs/packages/oauth-encryption.md`, `docs/security.md`, accounts and OAuth package source |
| Build systems | `docs/about/build-tool.md`, `docs/packages/rspack.md`, `docs/packages/meteor.md`, `tools/runners/run-rspack.js`, build integration tests |
| Data and reactivity | `docs/api/collections.md`, `docs/api/pubsub.md`, `docs/packages/mongo.md`, Mongo, DDP, and Tracker package source |
| React and Blaze | React and Blaze tutorials, API docs, integration repositories, and current package type declarations |
| Testing | `docs/develop/testing.md`, core test-command source, and both community test-driver repositories |
| Migration | Complete `v3-migration-docs` tree plus source for changed APIs |
| Deployment | `docs/production`, `docs/commandline`, and build/runtime implementation paths |

### Unowned documentation domains reviewed for candidate skills

| Domain | Current documentation | Why it is distinct |
|---|---|---|
| TypeScript | `docs/packages/typescript.md`, `docs/cli/using-core-types.md` | Compiler choice, type checking, core types, `.tsx`, and Rspack/SWC behavior form a fresh-project outcome beyond migration. |
| Package authoring | `docs/packages/7.writing-atmosphere-packages.md`, `docs/api/package.md` | `package.js`, architectures, dependencies, testing, local overrides, and publishing form a Meteor-specific lifecycle. |
| WebApp and Express | `docs/packages/webapp.md`, `docs/api/app.md` | Handler ordering, Express 5, static assets, caching, runtime config, and server rendering require current operational guidance. |
| Cordova | `docs/about/cordova.md` | Platform setup, device workflows, hot code push, native IDEs, signing, and distribution form a separate mobile lifecycle. |

## Skill claim matrix

The matrix groups adjacent claims that share the same source boundary. Evaluation numbers refer to each skill's `references/eval-cases.md`.

| ID | Skill and claim group | Evaluation coverage | Verdict | Source result |
|---|---|---|---|---|
| A01 | `meteor-accounts`: user creation, password login, signup policy, and password reset flows | 1-3, 5-9 | Covered | Current Accounts APIs and recent signup corrections align with core. |
| A02 | `meteor-accounts`: OAuth provider configuration, popup or redirect login, and PKCE routing | 4 and provider examples | Covered | Provider packages and OAuth flow source support the decision flow. |
| A03 | `meteor-accounts`: OAuth encryption storage target | Security evaluation 4 asserts the same claim | Outdated | Provider app secrets live in `ServiceConfiguration.configurations.secret`; user records contain provider-specific sealed tokens, not a generic `services.<provider>.secret`. |
| A04 | `meteor-blaze`: scaffold, imports, route ownership, and mixed-renderer boundaries | 1, 13, 14 | Covered | Blaze package exports and tutorial patterns support the scaffold and ownership rules. |
| A05 | `meteor-blaze`: Spacebars expressions, async helpers, subscriptions, and cursor reactivity | 2-6 | Covered | Blaze lookup and Tracker behavior support the stated async boundaries. |
| A06 | `meteor-blaze`: lifecycle hooks, component boundaries, event context, and cleanup | 7, 8, 10, 11, 15-17 | Covered | Blaze lifecycle and view APIs support the guidance. |
| A07 | `meteor-blaze`: `blaze-hot` HMR on the current Rspack scaffold | 9 | Outdated | Current Meteor build docs state that Blaze HMR is unavailable under Rspack and changes trigger a full page reload. |
| A08 | `meteor-blaze`: programmatic rendering and testing cleanup | 12 | Covered | `Blaze.render`, `Blaze.remove`, and test ownership guidance align with source. |
| A09 | `meteor-deployment`: production build, runtime layout, Node version, and hot code push | 1, 2 | Covered | Build output and runtime environment claims align with devel docs and source. |
| A10 | `meteor-deployment`: Docker stages, architectures, and native dependency builds | 3 | Covered | The deployment flow correctly separates build and runtime concerns. |
| A11 | `meteor-deployment`: settings, environment variables, reverse proxies, and update behavior | 4-6 | Covered | Current deployment docs support these operational boundaries. |
| A12 | `meteor-methods`: definitions, validation, optimistic stubs, simulation, and rate limiting | 1-3, 5, 6 | Covered | DDP method source and rate-limit APIs support the patterns. |
| A13 | `meteor-methods`: every rejected `callAsync` value is a `Meteor.Error` | 4 checks server error exposure only | Partial | Intentional server-visible failures use `Meteor.Error`, but callback misuse and local stub failures can reject with native or arbitrary errors. |
| A14 | `meteor-modern-build-stack`: `modern: true`, SWC, ignore rules, and bundler selection | 1-3, 6, 8-10 | Covered | Compiler and build-tool source support these choices. |
| A15 | `meteor-modern-build-stack`: Rspack helper configuration, entries, CSS, and package routing | 4, 5, 11-15 | Covered | Current `defineConfig` helpers and scaffold conventions align with the reference. |
| A16 | `meteor-modern-build-stack`: `thread-stream` as a transitive Mongo dependency | 7 exercises the valid workaround | Outdated | Core's regression fixture reaches `thread-stream` through a direct `pino` logging stack, not Mongo packages. The `compileWithMeteor` workaround remains valid. |
| A17 | `meteor-modern-build-stack`: legacy Meteor bundler optimization boundaries | Remaining build cases | Covered | Lazy modules, dynamic import, and production minification guidance remains current. |
| A18 | `meteor-mongo-minimongo`: client/server API split, selectors, modifiers, and index creation | 1-5 | Covered | Mongo package source supports the current async and client compatibility rules. |
| A19 | `meteor-mongo-minimongo`: query object key order must match compound index key order | No focused near-miss case | Outdated | Index key order, prefixes, ESR, and sort order matter; JavaScript selector property order does not have to mirror the index. |
| A20 | `meteor-mongo-minimongo`: change streams, collation, and reactive invalidation | 6 | Covered | The recently updated 3.5 behavior aligns with Mongo package source. |
| A21 | `meteor-pubsub`: publications, authorization, subscription handles, and ready state | 1, 4, 5, 7 | Covered | DDP publication and client subscription APIs support the patterns. |
| A22 | `meteor-pubsub`: publication strategies and merge-box tradeoffs | 3 | Covered | Server DDP source supports the named strategies and memory boundaries. |
| A23 | `meteor-pubsub`: low-level publications and ordered async observer callbacks | 2, 6 | Covered | Recent corrections align with async observer source behavior. |
| A24 | `meteor-react`: scaffold, entry module, Rspack routing, and Fast Refresh | 1-3, 13-16 | Covered | Current React package and Meteor Rspack sources support the scaffold. |
| A25 | `meteor-react`: classic `useTracker`, `useFind`, and `withTracker` APIs | 4-8 | Covered | Published package implementations and type declarations support these signatures. |
| A26 | `meteor-react`: Suspense hooks, signatures, loading boundaries, and mutation races | 9-12, 17-19 | Covered | Current `meteor/react-meteor-data` source supports the documented distinctions. |
| A27 | `meteor-react`: testing, routing, and classic-versus-Suspense near misses | 20 and cross-cutting cases | Covered | Routing boundaries and test patterns remain specific without owning generic React. |
| A28 | `meteor-security`: method and publication guards, validation, CSP, and secret handling | 1-3, 5-9 | Covered | Core security and runtime configuration sources support these controls. |
| A29 | `meteor-security`: OAuth encryption ciphertext is at `Meteor.users.services.google.secret` | 4 | Outdated | The asserted generic field does not exist; configuration secrets and provider user tokens have different storage targets. |
| A30 | `meteor-security`: rate limiting and `audit-argument-checks` coverage | 10 and related cases | Covered | Current packages support the defense-in-depth guidance. |
| A31 | `meteor-testing`: test modes, file discovery, package tests, and Mocha variables | 1, 3, 8 | Covered | Core commands and current `meteor-mocha` behavior align with the skill. |
| A32 | `meteor-testing`: direct handlers, DDP helpers, async cleanup, and isolation | 2, 4-7 | Covered | The recently corrected helper setup matches core test primitives. |
| A33 | `meteor-testing`: browser E2E drivers and clean-checkout execution | 9, 10 | Covered | Current browser-test driver supports Playwright and Puppeteer workflows. |
| A34 | `migrate-to-meteor-3`: migration sequencing, Fibers removal, and async API rewrites | Core migration cases among 1-25 | Covered | The main migration paths match devel migration docs and core APIs. |
| A35 | `migrate-to-meteor-3`: `callAsync` always rejects with `Meteor.Error` and error shape is unchanged | Method error case 19 | Partial | Server-visible intentional errors retain the shape, but callers must narrow other rejection values. |
| A36 | `migrate-to-meteor-3`: modules, cursor iteration, publications, and package triage | 2, 3, 5-7, 10, 13, 18 | Covered | Migration references align with their current source boundaries. |
| A37 | `migrate-to-meteor-3`: async reactive reads before and after the first `await` | 4 | Covered | `Tracker.withComputation` guidance matches Tracker source. |
| A38 | `migrate-to-meteor-3`: React client async Minimongo reads always lose reactivity | 4 and React case 24 expose the contradiction | Partial | Async reads can track before the first `await`; the React-specific reference conflicts with the skill's correct general reactivity reference. |
| A39 | `migrate-to-meteor-3`: WebApp, Express 5, TypeScript, Node, and build migration boundaries | Corresponding cases among 20, 22-25 | Covered | The migration-only scope is current and leaves fresh setup to potential dedicated skills. |
| A40 | `migrate-to-meteor-3`: raw collections, reset-database behavior, check, and Match changes | Corresponding cases among 1-25 | Covered | Recent edge-case additions align with current implementation. |
| A41 | `migrate-to-meteor-3`: wrapping publication registration in `EnvironmentVariable.withValue` preserves invocation context | 21 | Outdated | `withValue` must wrap the async handler invocation; wrapping registration evaluates connection state too early and does not scope later execution. |
| A42 | `migrate-to-meteor-3`: package and community case-study evidence | 23 and optional references | Covered | The references are appropriately secondary and do not replace primary claims. |
| A43 | `migrate-to-meteor-3`: the curl installer is being phased out | No focused evaluation | Outdated | Current install docs make `npx meteor` primary but still document curl as a supported Linux and macOS alternative without a phase-out statement. |
| A44 | `migrate-to-rspack`: activation, supported versions, entries, and nested project imports | 1, 5-8, 11 | Covered | Current core Rspack source and docs support these migration requirements. |
| A45 | `migrate-to-rspack`: client graph, dynamic imports, server-only modules, and package boundaries | 3, 9-13, 15, 18, 19 | Covered | Compilation and client-graph behavior align with current source. |
| A46 | `migrate-to-rspack`: React, Blaze, Vue, Solid, Svelte, CSS, and plugin migration | 2, 14, 16, 17 | Covered | The migration skeletons are appropriately bounded; the Blaze full-reload limitation is already documented here. |
| A47 | `migrate-to-rspack`: troubleshooting, memory, CI, multiple instances, and port derivation | 4, 6 and troubleshooting cases | Covered | Core port calculation and integration fixtures support the guidance and escape hatch. |
| A48 | `migrate-to-rspack`: `thread-stream` is transitively used by Mongo packages | Worker-loading case | Outdated | The worker-loading failure and workaround are valid, but the dependency provenance is not. |

No uncontrolled routing overlap was found. The one-skill `react` and `blaze` bundles are correctly isolated, and shared build, migration, and testing outcomes route to their existing specialist skills.

## Confirmed maintenance findings

### F01, correct OAuth encryption storage guidance

- Classification: Outdated
- Priority: P1
- Skills: `meteor-accounts`, `meteor-security`
- Files: `skills/meteor-accounts/SKILL.md`, `skills/meteor-security/SKILL.md`, `skills/meteor-security/references/eval-cases.md`
- Evidence: [`accounts-oauth/oauth_server.js`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/packages/accounts-oauth/oauth_server.js) seals provider configuration secrets at startup. Provider packages seal specific access-token fields. There is no generic `Meteor.users.services.<provider>.secret` target.
- Required maintenance: distinguish the application secret at `ServiceConfiguration.configurations.secret` from provider-specific per-user credentials, and make the evaluation assert actual storage fields.
- Acceptance: no skill claims a generic user-service `secret` field; examples identify which secret is being encrypted and where it is persisted.

### F02, separate Blaze HMR behavior by bundler

- Classification: Outdated
- Priority: P1
- Skill: `meteor-blaze`
- Files: description, scaffold section, `references/build-and-testing.md`, evaluation 9
- Evidence: [`v3-docs/docs/about/build-tool.md`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/v3-docs/docs/about/build-tool.md) states that Blaze HMR is not supported with Rspack. The `migrate-to-rspack` troubleshooting reference already records the full-page reload behavior.
- Required maintenance: reserve `blaze-hot` live template replacement for the Meteor bundler path, state that the default Rspack scaffold reloads the page, and update the trigger and evaluation.
- Acceptance: evaluation 9 fails any claim that a Rspack Blaze edit preserves live template state through HMR.

### F03, fix `EnvironmentVariable.withValue` placement

- Classification: Outdated
- Priority: P1
- Skill: `migrate-to-meteor-3`
- Files: `references/other-breaking-changes.md`, evaluation 21
- Evidence: [`packages/meteor/dynamics_nodejs.js`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/packages/meteor/dynamics_nodejs.js) scopes the callback passed to `withValue` with `AsyncLocalStorage.run`. Wrapping publication registration evaluates invocation state before the publication runs and cannot preserve that later invocation context.
- Required maintenance: wrap the actual async handler invocation, preserve the value across its awaits, and remove the registration-time example.
- Acceptance: the evaluation checks the value after an `await` inside a real invocation and rejects registration-only wrapping.

### F04, correct compound-index selector guidance

- Classification: Outdated
- Priority: P2
- Skill: `meteor-mongo-minimongo`
- Files: Mongo index guidance and evaluation cases
- Evidence: MongoDB's [compound index documentation](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/) and [ESR guideline](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/) define index key order, prefix, equality, sort, and range behavior. They do not require selector object property order to mirror index key order.
- Required maintenance: replace the selector-order statement with index-prefix and ESR guidance, then add a near-miss evaluation.
- Acceptance: a query with equality fields written in a different object order is not rejected solely for that order.

### F05, reconcile React migration reactivity guidance

- Classification: Partial
- Priority: P2
- Skill: `migrate-to-meteor-3`
- Files: `references/react-migration.md`, `references/client-reactivity.md`, evaluation cases
- Evidence: [`v3-migration-docs/front-end/react.md`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/v3-docs/v3-migration-docs/front-end/react.md) permits async client methods for isomorphic code. Tracker can capture reactive reads before the first `await`; later reads require `Tracker.withComputation`. The skill's general reference is correct, but its React reference makes a blanket nonreactivity claim.
- Required maintenance: make the React reference use the same before-or-after-first-await decision rule and add a React-focused case if the existing general case cannot detect regression.
- Acceptance: guidance neither bans all async client reads nor promises tracking after an `await` without an explicit computation.

### F06, narrow caught `callAsync` errors

- Classification: Partial
- Priority: P2
- Skills: `meteor-methods`, `migrate-to-meteor-3`
- Files: method error examples, migration method reference, evaluation cases
- Evidence: [`livedata_connection.js`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/packages/ddp-client/common/livedata_connection.js) throws a native `Error` for callback misuse, while a local stub can throw an arbitrary value before a server result. Intentional server-visible method failures should still use `Meteor.Error`.
- Required maintenance: narrow or shape-check caught values before accessing `error`, `reason`, or `details`; preserve the intentional server-error guidance.
- Acceptance: an evaluation covers a non-`Meteor.Error` local failure in addition to sanitized server failures.

### F07, remove the unsupported curl phase-out claim

- Classification: Outdated
- Priority: P3
- Skill: `migrate-to-meteor-3`
- File: `references/other-breaking-changes.md`
- Evidence: [`v3-docs/docs/about/install.md`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/v3-docs/docs/about/install.md) presents `npx meteor` as the primary cross-platform command and curl as a documented Linux and macOS alternative. It does not announce a phase-out.
- Required maintenance: state the documented preference without predicting removal.
- Acceptance: the skill accurately describes both supported installation paths.

### F08, correct `thread-stream` dependency provenance

- Classification: Outdated
- Priority: P3
- Skills: `meteor-modern-build-stack`, `migrate-to-rspack`, `meteor-deployment`
- Files: `references/rspack-config.md`, `references/troubleshooting.md`, `references/docker.md`
- Evidence: [`tools/e2e-tests/apps/monorepo/app/package.json`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/tools/e2e-tests/apps/monorepo/app/package.json) and its Rspack fixture exercise `thread-stream` through `pino`, not Mongo. The worker-path failure and `Meteor.compileWithMeteor(['thread-stream'])` recovery remain valid.
- Required maintenance: call it a worker-loading dependency, optionally note the `pino` logging stack, and remove all Mongo attribution.
- Acceptance: all three references agree on cause and workaround without inventing a Mongo dependency edge.

## Candidate skills

Candidate status authorizes design discussion only. It does not authorize creating a published folder or changing bundle membership.

| Candidate | Priority | Coherent outcome | Boundary and evidence needed before implementation |
|---|---:|---|---|
| `meteor-typescript` | P2 | Set up and debug current TypeScript in a Meteor application using the classic compiler or Rspack/SWC. | Own fresh setup, core types, type checking, `.tsx`, `tsconfig`, and common resolution failures. Exclude generic TypeScript and Meteor 2-to-3 migration. The existing migration reference explicitly leaves this outcome to a dedicated skill. |
| Package authoring skill | P3 | Create, test, locally override, version, and publish an Atmosphere package. | Choose the final name during maintenance, following `package-<thing>`. Cover `package.js`, architectures, NPM and peer dependencies, `devOnly`, test packages, and publishing. Exclude ordinary application package selection. |
| `meteor-webapp` | P3 | Build and debug server HTTP integration with current WebApp and Express APIs. | Own handlers, routers, ordering, static assets, caching, runtime config, server rendering, and auth boundaries. Exclude generic Express application design and the migration-only rename guide. |
| `meteor-cordova` | P3 | Run the Meteor mobile lifecycle from platform setup through signed distribution. | Own prerequisites, platforms, devices, emulators, native IDEs, hot code push, architectures, signing, and release builds. Exclude generic Cordova plugin authoring. |

## Documentation-only findings

### D01, `oauth-encryption` documentation contains legacy implementation details

The Windows section in `v3-docs/docs/packages/oauth-encryption.md` describes the removed `npm-node-aes-gcm`, OpenSSL, and Visual Studio 2008 dependency. Current [`packages/oauth-encryption/encrypt.js`](https://github.com/meteor/meteor/blob/5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe/packages/oauth-encryption/encrypt.js) uses Node's `crypto` module. Its migration snippet also uses a synchronous server collection update. F01 should keep the published skills accurate without copying these legacy details.

### D02, the React migration document understates current `useFind` differences

The migration document says `useFind` remains the same, while the current Suspense export has a distinct signature and behavior. `meteor-react` already documents the current classic and Suspense APIs from the frozen React integration source, so no additional skill maintenance is required for this documentation issue.

## Uncertain finding

### U01, dedicated Vue, Svelte, and Solid skills

Meteor has full framework tutorials, while `migrate-to-rspack` currently owns only framework loader and skeleton migration. This may justify dedicated runtime skills and one-skill bundles similar to React and Blaze. The audit did not find enough evidence of recurring Meteor-specific failure modes or enough reviewed integration-package source to authorize three new skills. Reassess after user demand, framework package changes, or a focused source audit.

## Confirmed no-action boundaries

- The `react` and `blaze` bundles each contain only their matching framework skill. Users can install either without the other.
- Rspack multi-instance guidance correctly requires distinct `PORT` and `METEOR_LOCAL_DIR` values and documents the explicit dev-server port escape hatch.
- Current testing-driver variables, Playwright and Puppeteer support, direct handler setup, and DDP client setup are covered.
- Recent maintenance for change streams, collation, publication strategies, async observer ordering, rate-limit matchers, and Rspack version defaults matches the frozen source revisions.
- `Meteor.startup` async hooks are awaited during application startup, so the current migration guidance remains valid within that lifecycle.

## Maintenance handoff

- Authorized implementation scope: audit record and commit only
- Published skill changes authorized by this audit turn: none
- Confirmed maintenance ready for `skill-maintenance`: F01-F08
- Release blockers: F01, F02, F03
- Recommended maintenance groups:
  1. OAuth storage corrections across Accounts and Security, F01.
  2. Blaze bundler-specific HMR correction, F02.
  3. Migration correctness for `withValue`, React reactivity, error narrowing, and installer wording, F03, F05, F06, F07.
  4. Mongo compound-index correction, F04.
  5. Cross-skill `thread-stream` wording correction, F08.
- Candidate implementation requiring explicit approval: `meteor-typescript`, package authoring, `meteor-webapp`, `meteor-cordova`
- Deferred pending evidence: U01
- Upstream documentation follow-up outside published-skill maintenance: D01, D02
- Next audit rule: use this report as the previous baseline and compare Meteor revision `5cafdbc20f5afe5ec82430700d046f7f6ce2b2fe` with the new target revision. Run a new full audit only if this record or the intervening Git history cannot reliably reconstruct scope.

The report is immutable after commit. Corrections or later comparisons must be recorded in a new dated file that names this report under `Previous audit report`.
