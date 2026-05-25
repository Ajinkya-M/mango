# Mango Architecture

Last updated: 2026-05-25

## Target architecture

- Single Next.js full-stack app using the App Router only.
- TypeScript strict mode throughout the codebase.
- Tailwind CSS only for styling.
- Prefer Server Components. Use client components only for real interactivity.
- Keep secrets on the server. Never expose privileged credentials to the browser.
- Validate all server-side inputs with Zod.
- Recalculate all pricing and totals on the server.
- Validate stock on the server before creating an order.
- Protect admin routes with server-side auth checks.

## Current implementation snapshot

- The current app is still a front-end prototype.
- There are only two routes: `/` and `/admin`.
- Both routes are client components.
- Product data is stored in `localStorage` under `mango_products`.
- Admin auth is a demo-only `sessionStorage` flag with hardcoded credentials.
- There are no API routes, server actions, middleware guards, or database integrations yet.
- There is no Supabase wiring in the codebase yet.

## Architecture gap to close

1. Move catalog, inventory, auth, and orders out of browser storage and into a server-backed data model.
2. Introduce server-side validation with Zod for all write paths.
3. Replace demo admin auth with real server-side protected access.
4. Move price calculation and stock validation to server code before checkout/order creation.
5. Reduce the large all-in-one client pages into smaller components and server-first route structure.

## Deployment notes

- Local GitHub repo for this workspace: `Ajinkya-M/mango`
- Current Vercel project discovered during repo inspection: `mango-vercel`
- Current Vercel Git integration points at GitHub repo `Ajinkya-M/mango-vercel`, not `Ajinkya-M/mango`

This mismatch should be resolved before treating Vercel deploys as deploys of this exact workspace.
