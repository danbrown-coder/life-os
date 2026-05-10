# LifeOS

An adaptive life operating system. Generates a fully personalized weekly timetable with detailed execution plans across fitness, nutrition, study, BJJ, recovery, social, hobbies, and work — and learns you over time via a durable life graph.

Not a calendar. Not a tracker. An AI coach that understands the whole person.

## Stack

- Expo (React Native) + TypeScript + expo-router
- NativeWind (Tailwind for RN)
- Supabase: auth, Postgres, RLS, Edge Functions
- Anthropic Claude (via Edge Functions — never on device)
- Zod, Zustand, TanStack Query, dayjs

## Getting started

```bash
# 1. Install JS deps and align native deps to Expo SDK
npm install
npx expo install --fix

# 2. Local Supabase (requires Docker)
supabase start
supabase db reset            # applies migrations in supabase/migrations
npm run supabase:types       # regenerates lib/db/types.ts

# 3. Set env
cp .env.example .env
# fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (from `supabase status`)
# fill ANTHROPIC_API_KEY for edge function secrets:
supabase secrets set ANTHROPIC_API_KEY=...

# 4. Run app
npx expo start
```

## Project layout

```
app/                          # expo-router screens (auth / onboarding / app)
components/blocks/            # category-specific block renderers
components/ui/                # primitives (Card, Ring, Slider, Chip, Button)
lib/ai/                       # Zod schemas, prompts, edge function client
lib/db/                       # generated supabase types + queries
lib/state/                    # zustand stores
lib/mock/                     # mock data for pre-AI UI dev
supabase/migrations/          # 0001_init.sql — all tables + RLS
supabase/functions/           # generate-week, adjust-day, extract-memory, weekly-reflection, detect-phase
```

## Phases

1. Foundation — auth, schema, onboarding, mock data
2. AI generation — `generate-week` with category-specific execution plans
3. Reality + adaptation — daily check-ins, executions, `adjust-day`
4. Memory / life graph — `extract-memory`, Memory screen, prompt injection
5. Lifestyle polish — notifications, phase detection, performance modes

## Principles

- **Low-friction memory**: never force >1 minute/day of logging. Inference > input.
- **No-guilt adaptation**: every "I missed it / ate pizza / skipped" is a normal input, never failure framing.
- **Coach voice, not spreadsheet voice**: every block answers what + how + why.
- **Memory is visible**: the user can see and edit what the system has learned.
- **Whole-person from day 1**: social, emotional, hobby blocks alongside training and study.
