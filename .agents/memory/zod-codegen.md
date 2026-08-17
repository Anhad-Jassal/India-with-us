---
name: Generated Zod compatibility
description: Compatibility note for the OpenAPI-generated Zod validation package.
---

Orval currently emits top-level Zod 4 helpers such as `z.int()` and `z.email()` for this workspace's OpenAPI generation.

**Why:** The workspace catalog still resolves Zod 3 for most packages, and generated validation fails typechecking when it resolves that version.

**How to apply:** Keep `@workspace/api-zod` on its own Zod 4 dependency, reinstall after changing the package manifest, and rerun `pnpm --filter @workspace/api-spec run codegen`.