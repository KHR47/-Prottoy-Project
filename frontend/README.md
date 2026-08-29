# Smart City Ecosystem Web

Next.js frontend for the Smart City Ecosystem platform.

## Main Areas

- Citizen dashboards for reports, utilities, parking, and transport
- Admin dashboards for users, categories, parking, transport, reports, and utilities
- Authority dashboards for water, gas, and electricity operations
- Operator workflows for transport and parking
- Driver, attendant, and officer role-specific pages

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Helper Scripts

```bash
npm run seed:parking-lots
```

Helper scripts are kept in `scripts/`.

## Source Layout

- `src/app/` - Next.js App Router pages and route folders
- `src/components/` - shared UI, layout, map, and report components
- `src/context/` - React context providers
- `src/hooks/` - shared React hooks
- `src/lib/` - API, auth, and utility helpers
- `src/types/` - shared TypeScript types
