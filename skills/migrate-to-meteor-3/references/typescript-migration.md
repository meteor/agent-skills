# TypeScript migration

Choose Meteor import declarations separately from the compiler or bundler
while migrating an existing application. Preserve a working `@types/meteor`
or `zodern:types` setup by default. Meteor 3.6+ also offers explicit native
declarations; changing to SWC/Rspack does not select that provider.

## What breaks

If `meteor/*` imports become `any` or fail after an upgrade, inspect the
selected declaration provider and TypeScript resolution. Do not assume the
framework upgrade invalidated every existing type package or that changing
the transpiler fixes declaration lookup.

## Select the provider

On Meteor 3.0 through 3.5, keep or repair the established provider; `meteor
types` is unavailable. On 3.6+, ordinary run/build/test/lint commands still do
not select or generate native declarations. If the user explicitly wants the
native provider, follow [native package types](../../meteor-modern-build-stack/references/native-package-types.md)
for generation, per-package paths and the explicit ambient barrel. A direct
`zodern:types` dependency makes `meteor types` skip successfully; transitive
presence alone does not. Do not remove providers just to upgrade Meteor.

## Existing zodern provider

```bash
meteor add zodern:types
```

`zodern:types` ships generated `.d.ts` files keyed off your local Meteor
install. It replaces the older approaches used in Meteor 2.

## `tsconfig.json` updates

Two changes are required:

```jsonc
{
  "compilerOptions": {
    // 1. Resolve symlinks the way Meteor's package layout expects.
    "preserveSymlinks": true,

    // 2. Map meteor/* imports to the generated types directory.
    "baseUrl": "./",
    "paths": {
      "meteor/*": [".meteor/local/types/packages.d.ts"]
    }
  }
}
```

Without `preserveSymlinks: true`, TypeScript follows symlinks in
`.meteor/local/build/` and reports duplicate identifier errors. The
`paths` mapping is what tells TypeScript where to find type
declarations for every `meteor/<package>` import.

## After the changes

Restart your TS server (or your editor) so the new `tsconfig.json` is
picked up. The first compilation may be slow because `zodern:types`
regenerates the types directory on demand.

## Symptoms

- `import { Meteor } from 'meteor/meteor';` resolves to `any`, no
  autocomplete. The `paths` mapping in `tsconfig.json` is missing.
- "Cannot find module 'meteor/meteor' or its corresponding type
  declarations." Inspect the selected provider and its generated files; do
  not automatically install zodern over an explicitly chosen native provider.
- "Duplicate identifier 'Meteor'." `preserveSymlinks` is not set.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/v3-migration-docs/typescript/meteor-types.md
