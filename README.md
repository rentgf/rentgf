# RentGF — Full Implementation

A companionship marketplace built with Next.js 16 and Supabase.

## Setup

### 1. Install dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 2. Environment variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=https://qhrjkwvfujpzuurttkdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Get your anon key from: **Supabase Dashboard → Project Settings → API → anon public key**

### 3. Run dev server

```bash
pnpm dev
```

## Features Implemented

- **Auth**: Real sign up, login, forgot password, password reset via Supabase Auth
- **Middleware**: Protected routes redirect to login
- **Companions**: Feed fetched from Supabase (approved + visible companions)
- **Bookings**: Real booking creation saved to database with status tracking
- **Messages**: Real-time chat via Supabase Realtime (postgres_changes)
- **Favorites/Likes**: Saved to database, synced across devices
- **Dashboard**: Live booking counts, favorite counts, unread notifications
- **Notifications**: Real notifications created on booking events

## Architecture

- `lib/supabase/` — Supabase client setup (browser, server, middleware)
- `lib/supabase/database.types.ts` — Full TypeScript types for all tables
- `lib/data/` — Server actions for companions, bookings, messages, favorites
- `middleware.ts` — Session refresh + route protection

