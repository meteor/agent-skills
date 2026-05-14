# `browser-policy` CSP recipes

`BrowserPolicy` is server-only. Call its functions at module top level or
inside `Meteor.startup`. Runtime mutation does not take effect; Meteor
fixes the policy on server boot.

## Install

```bash
meteor add browser-policy
```

Pulls in both `browser-policy-content` (CSP) and `browser-policy-framing`
(X-Frame-Options). Add either standalone for a smaller surface.

## Tight default

```javascript
import { BrowserPolicy } from "meteor/browser-policy-common";

BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowEval();
BrowserPolicy.framing.disallow();
```

Removes `eval`, inline `<script>` blocks, and embedding by other sites.

## Stripe Checkout / Elements

```javascript
BrowserPolicy.content.allowOriginForAll("https://js.stripe.com");
BrowserPolicy.content.allowFrameOrigin("https://js.stripe.com");
BrowserPolicy.content.allowFrameOrigin("https://hooks.stripe.com");
```

## Google Maps / Fonts / GTM

```javascript
BrowserPolicy.content.allowOriginForAll("https://maps.googleapis.com");
BrowserPolicy.content.allowOriginForAll("https://fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("https://fonts.gstatic.com");
BrowserPolicy.content.allowOriginForAll("https://www.googletagmanager.com");
```

## Inline styles (framework injects them)

```javascript
BrowserPolicy.content.allowInlineStyles();
```

Tradeoff: weakens style protection. Use only when the framework (e.g.
Material UI, styled-components) genuinely needs it.

## Frame-ancestors (Chrome / Safari)

`X-Frame-Options` is partly ignored by Chrome / Safari. To restrict
framing across browsers, use the CSP `frame-ancestors` directive:

```javascript
BrowserPolicy.content.allowFrameAncestorsOrigin("https://example.com");
```

## Reset

```javascript
BrowserPolicy.content.setPolicy(...)   // override entire content policy
BrowserPolicy.framing.allowAll()       // unset X-Frame-Options
```

Used in tests where the default policy interferes.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/packages/browser-policy.md
