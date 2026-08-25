# Catalog classification

Treat classification and routing as stable behavior:

- For an existing skill, preserve its name, `metadata.kind`, `metadata.area`, bundle membership, Meteor range, routing scope, and useful local structure by default.
- Change a classification only when verified behavior no longer fits it and the user authorized the scope change. Review neighboring descriptions and evaluation cases because recategorization can change skill selection and installation expectations.
- For a new skill, use the closest neighboring skills to choose the naming family, kind, area, bundle membership, body shape, reference placement, and evaluation style.
- Reuse an existing area when it fits. Add a new area only when no current domain fits, then update `AGENTS.md` and `skill.schema.json` in the same change.
- Base bundle membership on the installation audience that needs the complete skill. Keep `metadata.bundle` and `bundles.json` synchronized.
- Do not normalize an existing skill merely for visual consistency. Preserve local patterns unless they conflict with the repository contract or block the requested behavioral change.
