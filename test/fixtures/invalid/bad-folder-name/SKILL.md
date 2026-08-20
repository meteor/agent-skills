---
name: not-the-folder
description: >
  Use when testing folder/name mismatch. Triggers on validator unit tests.
metadata:
  author: meteor
  version: "0.1.0"
  kind: knowledge
  meteor: ">=3.0"
  area: testing
  tagline: "Fixture tagline for the folder/name mismatch case."
---

# Folder mismatch

Folder is `bad-folder-name`, `name` is `not-the-folder`. Validator should reject with `E_FOLDER_MISMATCH`.
