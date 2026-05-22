# Mango — Codex Instructions

This file is read automatically by Codex at the start of every session.
For full project context, read `ai-context/` before doing any work.

---

## Package Rules

- **Always use `pnpm` for package installation** — never `npm install` or `yarn add`.
- **Only install package versions that are at least 1 year old.**
  This applies to the specific version being installed, not just the package itself.
  Before installing any package version, verify its publish date via:
  `npm view <package> time --json`
  Then pick the latest stable version (no `-beta`, `-rc`, `-alpha`, `-next` tags) whose publish
  date is more than 12 months before today.
  Do not install any version released within the last 12 months, regardless of how popular it is.
- Prefer packages with a long track record of stability (e.g. zod, zustand, bcryptjs, jose, @supabase/supabase-js).
- Do not introduce packages that themselves were first published less than 12 months ago.

## Architecture Rules

See `ai-context/architecture.md` for the full set. Summary:

- Single Next.js full-stack app (App Router only). No separate Express backend.
- TypeScript strict mode everywhere.
- Tailwind CSS only — no other styling libraries.
- Prefer Server Components. Use `"use client"` only where interactivity is required.
- Never expose secrets to the client.
- Validate ALL server-side inputs with Zod.
- Never trust client-supplied totals or prices — always recalculate server-side.
- Validate stock before creating an order.
- Protect all admin routes server-side.

## AI Coordination

This project uses multiple AI agents (Codex, Codex, ChatGPT, Cursor, etc.).

**Before coding:** read `ai-context/current-state.md` and `ai-context/tasks.json`.
**After coding:** update `ai-context/current-state.md`, `ai-context/handoff.md`, and `ai-context/tasks.json`.
**Architecture changes:** add a new ADR in `ai-context/adrs/`.
