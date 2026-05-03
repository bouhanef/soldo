# Expense Tracker — CLAUDE.md

## Project overview

Personal expense tracking web app. Users log expenses with a date, category, source, amount (€), and optional comment. Categories and sources are fully configurable by the user.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: MongoDB Atlas via Mongoose
- **Charts**: Recharts
- **Validation**: Zod
- **Notifications**: shadcn Sonner (toast)

## Project structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx          # Dashboard with stats + charts
│   ├── expenses/
│   │   └── page.tsx          # Expense list + filters
│   ├── settings/
│   │   └── page.tsx          # Categories & Sources management
│   └── api/
│       ├── expenses/
│       │   ├── route.ts       # GET (filtered), POST
│       │   ├── [id]/route.ts  # PATCH, DELETE
│       │   └── export/route.ts # GET → CSV stream
│       ├── categories/
│       │   ├── route.ts       # GET, POST
│       │   └── [id]/route.ts  # PATCH, DELETE
│       ├── sources/
│       │   ├── route.ts       # GET, POST
│       │   └── [id]/route.ts  # PATCH, DELETE
│       └── stats/
│           └── route.ts       # GET → aggregated stats
├── lib/
│   ├── db.ts                  # Mongoose singleton connection
│   └── models/
│       ├── expense.ts
│       ├── category.ts
│       └── source.ts
├── components/
│   ├── layout/
│   │   └── sidebar.tsx
│   ├── expenses/
│   │   ├── expense-form.tsx
│   │   ├── expense-table.tsx
│   │   └── expense-filters.tsx
│   ├── dashboard/
│   │   ├── stat-cards.tsx
│   │   ├── monthly-bar-chart.tsx
│   │   └── category-donut-chart.tsx
│   └── settings/
│       ├── categories-tab.tsx
│       └── sources-tab.tsx
└── types/
    └── index.ts               # Shared TypeScript types
```

## Data models

### Expense
```typescript
{
  _id: ObjectId
  date: Date
  categoryId: ObjectId        // ref: Category
  sourceId: ObjectId          // ref: Source
  amount: number              // euros, positive
  comment?: string
  createdAt: Date
}
```

### Category
```typescript
{
  _id: ObjectId
  name: string
  color: string               // hex color for badge display
  isActive: boolean           // soft delete
}
```

### Source
```typescript
{
  _id: ObjectId
  name: string
  isActive: boolean           // soft delete
}
```

## API conventions

- All routes return `{ data, error }` shaped JSON
- Error responses: `{ error: string }` with appropriate HTTP status
- Soft-delete only — never hard-delete categories or sources (they are referenced by expenses)
- `GET /api/expenses` accepts query params: `month` (YYYY-MM), `categoryId`, `sourceId`, `page`, `limit`
- `GET /api/stats` accepts query param: `year` (YYYY)

## Key implementation rules

1. **DB connection** — always use the singleton in `lib/db.ts`, never create new connections in route handlers
2. **Validation** — all POST/PATCH bodies must be validated with Zod before touching the DB
3. **Amount** — stored as a plain number (euros). Display always formatted with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' })`
4. **Dates** — stored as UTC Date in MongoDB. Display in the user's locale. Date picker returns ISO string, convert before saving
5. **Populate** — always populate `categoryId` and `sourceId` when returning expenses to the client (use `.populate('categoryId sourceId')`)
6. **Filters** — category and source dropdowns only show `isActive: true` records
7. **Stats aggregation** — use MongoDB aggregation pipeline (`$group`, `$lookup`) server-side, never load all expenses to compute stats client-side

## Communication style

Be concise. No filler sentences. If the answer is 3 lines, write 3 lines — not 3 paragraphs. No "Great question!", no recap of what you just did, no "In summary". Just the answer.

## Design principles

The UI must be beautiful, minimalist, and intentional. Every screen should feel crafted, not generated.

- **Whitespace is the primary design tool** — generous padding, breathing room between elements, never cramped
- **Typography hierarchy** — clear distinction between headings, labels, and body. Font weights and sizes must create visual rhythm
- **Color restraint** — one accent color maximum (use the category color as the only color accent). Backgrounds are neutral (white / zinc-50 / zinc-900 in dark mode)
- **No decorative clutter** — no gradient blobs, no card shadows stacked on card shadows, no icons for the sake of icons
- **Borders over shadows** — prefer subtle `border` (`zinc-200` / `zinc-800`) over `box-shadow` for separation
- **Tables feel like tables** — clean rows, aligned columns, monospace for amounts
- **Forms are calm** — inputs have no excessive rounding, labels sit above inputs, no floating labels
- **Transitions are subtle** — 150ms ease for hover states, nothing bounces

Reference aesthetic: Linear, Vercel dashboard, Raycast — precise, calm, functional.


- Language: **English** throughout (labels, placeholders, error messages)
- Component library: shadcn/ui — prefer shadcn primitives over custom HTML
- Forms: controlled inputs, no `<form>` with native submit — use `onClick` handlers
- Loading states: shadcn Skeleton on list/table while fetching
- Errors: Sonner toast for CRUD feedback (`toast.success`, `toast.error`)
- Empty states: always show a meaningful empty state message, never a blank page

## Environment variables

```env
MONGODB_URI=mongodb+srv://...
```

## Tasks completed

- [ ] 1. Project setup (Next.js, Tailwind, shadcn, Mongoose)
- [ ] 2. MongoDB connection + Mongoose models
- [ ] 3. Seed data (default categories + sources)
- [ ] 4. Categories API (CRUD)
- [ ] 5. Sources API (CRUD)
- [ ] 6. Settings UI (/settings — two tabs)
- [ ] 7. Expenses API (CRUD + filters)
- [ ] 8. Add expense form
- [ ] 9. Expense list view (table + filters)
- [ ] 10. Stats API (aggregation pipeline)
- [ ] 11. Dashboard UI (stat cards + charts)
- [ ] 12. Layout & navigation (sidebar, responsive, dark mode)
- [ ] 13. CSV export
- [ ] 14. Error handling & loading states
