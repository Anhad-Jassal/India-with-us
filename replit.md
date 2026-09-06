# India With Us

India With Us is a travel marketplace for discovering India, booking considered ready-made journeys, and creating custom itineraries.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/india-with-us` — responsive React/Vite product experience and routes
- `artifacts/api-server/src/routes/travel.ts` — travel API, demo checkout, planner generation, auth session, and contact flow
- `lib/api-spec/openapi.yaml` — source of truth for generated API clients and validation
- `lib/api-client-react` / `lib/api-zod` — generated frontend hooks and server schemas

## Architecture decisions

- The visual language is editorial and warm: Playfair Display, DM Sans, saffron, clay, teal, and large India photography.
- Public travel data uses a curated India-only seed set so the first preview is useful even before an admin adds content.
- Customer accounts, bookings, saved plans, managed tours, blacklist status, and contact settings live in Replit PostgreSQL; GitHub should contain only code/schema, never customer records.
- Checkout is intentionally demo/payment-ready: it creates an order record without ever accepting raw card details.
- API contracts are OpenAPI-first; run codegen after changing `lib/api-spec/openapi.yaml`.

## Product

Visitors can search destinations and tours, browse tour details, submit a demo booking, create an account, build a multi-step custom trip, save plans, contact support, and view an admin operations summary.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The original in-memory demo state has been moved to PostgreSQL; use the database pane to inspect development records and keep production data out of GitHub.
- The generated Zod client uses Zod 4 APIs, so `@workspace/api-zod` intentionally pins its own Zod 4 dependency even though the broader workspace catalog remains on Zod 3.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
