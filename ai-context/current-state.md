# Mango Current State

Last updated: 2026-05-25 22:04 Europe/London

## Summary

Mango is currently a polished Next.js prototype for a mango storefront and a basic admin panel. The UX is implemented, but core production architecture is not in place yet. The app currently behaves like a local demo rather than a secure commerce system.

## Repo and deployment facts

- Local workspace path: `D:\Ajinkya\workspace\node-projects\mango`
- Local GitHub remote: `https://github.com/Ajinkya-M/mango.git`
- Active local branch at inspection time: `feat/order-system`
- Vercel team: `ajyamankar-6261's projects`
- Vercel project: `mango-vercel`
- Vercel project framework: `nextjs`
- Vercel Git repo currently linked in deployment metadata: `Ajinkya-M/mango`
- Vercel production branch currently seen in deployment metadata: `feat/order-system`
- Latest verified production deployment commit: `67de7c1` (`Add mango ai context files`)
- Latest verified production deployment URL: `mango-vercel-mf7fl67h5-ajyamankar-6261s-projects.vercel.app`

## Codebase shape

- `app/page.tsx`
  Main storefront flow implemented as one large client component.
- `app/admin/page.tsx`
  Admin inventory UI implemented as one large client component.
- `app/layout.tsx`
  Global layout and metadata.
- `app/globals.css`
  Tailwind v4 theme tokens and animation utilities.

## Current behavior

- Customer flow simulates phone login and OTP in the browser only.
- Storefront state, product inventory, and cart behavior are driven client-side.
- Product inventory is persisted in browser `localStorage`.
- Admin login uses hardcoded demo credentials and a `sessionStorage` auth flag.
- Admin CRUD updates write directly to browser storage.
- No network calls, server actions, or API routes are present.

## Major risks / gaps

1. Admin protection is not real. `admin/admin123` is hardcoded in the client and can be bypassed.
2. Inventory is not shared across users because it lives in each browser's local storage.
3. Orders, pricing, and stock validation are not enforced server-side.
4. The app does not yet follow the intended full-stack architecture documented in `AGENTS.md`.
5. Production is currently tied to `feat/order-system` rather than a conventional long-lived branch like `main`.

## Tooling notes

- Package manager policy says `pnpm`, but the repo currently still contains `package-lock.json`.
- Dependencies are minimal: Next.js, React, React DOM, Tailwind v4, TypeScript, ESLint.
- No Supabase client, schema, env setup, or auth integration exists yet.

## Recommended next milestone

Build the first real backend slice:

1. Decide whether production should continue using `feat/order-system` or move to a long-lived release branch such as `main`.
2. Add environment and data model setup.
3. Introduce server-side auth for admin access.
4. Move products and inventory to persistent storage.
5. Implement server-side order creation with validation and stock checks.
