---
name: _template
description: >
  Use when scaffolding a new Meteor skill. Triggers on copying this template.
  Use this skill when authoring SKILL.md. Ask about the skill folder layout.
metadata:
  author: meteor
  version: "0.0.0"
  kind: knowledge
  meteor: ">=3.0"
  area: meta
---

# Template skill

This folder is the template for new skills. The leading underscore in the folder
name keeps the validator happy (the catalog generator added in plan 06 skips
folders starting with `_`).

Copy this folder when creating a new skill:

```bash
cp -r skills/_template skills/my-new-skill
```

Then edit:

- Folder name: must equal `name` in frontmatter.
- `name`: lowercase-kebab-case.
- `description`: at least two trigger phrases.
- `metadata.version`: start at `0.1.0`.
- This body: replace with the actual skill content.
