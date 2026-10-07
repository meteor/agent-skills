# Native Meteor package declarations

Meteor 3.6+ offers explicit `meteor types` generation. On earlier releases,
keep the established `@types/meteor`/`zodern:types` provider. SWC, Rspack and the
Atmosphere `typescript` package transpile code; they do not select a declaration
provider or type-check the app. Preserve a working provider during an upgrade
unless the user separately chooses the native path.

## Opt in deliberately

1. Check `tsconfig.json`/`jsconfig.json`, extended configs, direct Meteor
   constraints and npm type dependencies. Without either config, `meteor
   types` does nothing. Ordinary run/build/test/lint commands do not generate,
   remove or choose native declarations.
2. A direct `zodern:types` dependency retains ownership and makes `meteor types`
   skip successfully without touching output. Remove that direct dependency
   only for an authorized provider switch. Transitive presence alone does not
   suppress native generation.
3. Run `meteor types`. On success it writes `.meteor/types/` and removes stale
   legacy `.meteor/local/types` output. On failure it exits nonzero and retains
   legacy output; diagnose the error before discarding a working provider.
4. Merge these native entries into the existing config, preserving unrelated
   paths, source patterns, files and compiler options:

   ```json
   {
     "files": ["./.meteor/types/packages.d.ts"],
     "compilerOptions": {
       "baseUrl": ".",
       "paths": { "meteor/*": ["./.meteor/types/packages/*"] }
     }
   }
   ```

   The per-package adapters resolve ordinary imports; the explicit barrel in
   `files` covers scoped packages/sub-paths even if `.meteor/**` is excluded.
   Do not map `meteor/*` to the barrel, which is not an external module.
5. After successful generation, stop loading competing ambient types: remove
   a direct `@types/meteor` dependency and only the `"meteor"` entry in any
   `compilerOptions.types`. Preserve other type libraries.
6. Keep the app's installed TypeScript compiler version stable and run a local
   script such as `"check-types": "meteor types && tsc --noEmit"`. Generate in
   CI explicitly; a passing build is not proof of type correctness.

Do not edit or commit `.meteor/types/`; generation replaces it and supplies
its own ignore file. A JavaScript app can opt in with `jsconfig.json` for
IntelliSense, but a JS-only app with no config should remain unchanged.
New 3.6 TypeScript templates retain their existing provider order: native paths
are a fallback, not a silent migration.

---
Source: https://github.com/meteor/meteor/blob/devel/v3-docs/docs/cli/using-core-types.md
