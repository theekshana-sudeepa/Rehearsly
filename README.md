# Rehearsly

**Rehearse the conversation you're dreading — with a partner who pushes back like a real person.**

Rehearsly lets you practise hard conversations (giving difficult feedback, setting a boundary,
saying no, a family talk you keep postponing) against an AI roleplay partner that stays in
character and resists realistically. When you're done, you get a structured breakdown of how you
came across — so the real conversation feels familiar instead of frightening.

Built for the [RevenueCat Shipaton 2026](https://shipaton.revenuecat.com/).

> Rehearsly is a confidence-building practice tool. It is **not** therapy, counselling, or crisis
> support, and it does not pretend to be — see [Safety](#safety).

---

## Status

Week 1 of 7 complete (scaffold). The app is navigable end to end; the roleplay engine, paywall,
push, and growth experiment land on the schedule in [`CLAUDE.md`](CLAUDE.md) §9.

| Area | State |
|---|---|
| Expo + TypeScript strict, NativeWind, design system | ✅ Done |
| Navigation shell, all 10 screens routable | ✅ Done |
| Supabase auth (sign up / sign in / sign out) | ✅ Done |
| Postgres schema + RLS + 15 seeded scenarios | ✅ Done, verified against real Postgres |
| Crisis-safety intercept | ✅ Done, 46 tests |
| Onboarding A/B assignment | ✅ Assigning and persisted locally |
| Roleplay chat + OpenAI Edge Function | ⏳ Week 2 |
| Structured feedback + RevenueCat paywall | ⏳ Week 3 |
| OneSignal campaigns + store submission | ⏳ Week 4 |
| Layers experiment live | ⏳ Week 5 |

---

## How it works

```
┌─────────────────────────────────────────────────────────┐
│  React Native (Expo SDK 57) · TypeScript strict         │
│                                                         │
│  Screens ──▶ Zustand stores ──▶ Supabase JS client      │
│     │                                                   │
│     └──▶ lib/safety.ts  ◀── runs BEFORE any network I/O │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│    Auth          email/password, session in AsyncStorage│
│    Postgres      profiles · scenarios · sessions (RLS)  │
│    Edge Function roleplay + feedback  ◀── holds the     │
│                                          OpenAI key     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                    OpenAI API (gpt-4o-mini)
```

**The OpenAI key never reaches the client.** All model calls route through a Supabase Edge
Function, so the key lives in server-side secrets. `.env.example` documents this explicitly —
`OPENAI_API_KEY` is deliberately *not* prefixed `EXPO_PUBLIC_`, because anything with that prefix
is inlined into the shipped bundle.

### The core loop

1. **Pick a scenario** — a preset from the catalogue, or describe your own situation in free text.
2. **Roleplay** — chat with a partner playing the other person, with calibrated emotional
   resistance: it doesn't fold at your first good point, and it doesn't stonewall forever.
3. **End any time** — "End & get feedback" is always visible.
4. **Feedback** — Clarity, Empathy, Assertiveness and Confidence scored 1–5, one thing that
   worked, and 2–3 specific tips tied to what you actually said.
5. **Streak** — consecutive practice days build a visible streak.

### Repository layout

```
App.tsx                     Providers: gesture handler, safe area, navigation
design-tokens.js            Single source of truth for colour + type tokens
src/
  components/ui/            Screen, Button, Card, TextField
  components/CrisisSupport  The surface shown instead of a roleplay
  lib/safety.ts             Crisis intercept (+ safety.test.ts)
  lib/supabase.ts           Client; null-safe when unconfigured
  lib/env.ts                Typed EXPO_PUBLIC_* access
  navigation/               Typed stack + tabs
  screens/                  Ten screens per the product spec
  stores/                   Zustand: auth, onboarding
  types/database.ts         Mirrors the SQL migrations
supabase/
  migrations/               Schema, RLS, seed catalogue
  tests/run.sh              Verifies migrations on a throwaway cluster
CLAUDE.md                   The full build brief and constraints
```

---

## Safety

Rehearsly rehearses everyday hard conversations. It must never roleplay a crisis back at someone.

[`src/lib/safety.ts`](src/lib/safety.ts) screens free text for indicators of self-harm, suicidal
ideation, abuse, or intent to harm others. When it fires, the app shows a warm message pointing to
real support and **does not** generate a roleplay. Design decisions worth stating:

- **It runs before any network call**, so crisis content is never transmitted to a model provider.
- **It is tuned to over-trigger.** A false positive costs one redirect to support. A false negative
  means roleplaying someone's crisis. The test suite pins 14 benign phrasings that must *not*
  trigger ("kill the project", "this deadline is killing me") to keep that bias honest.
- **Defence in depth.** Every seeded scenario prompt also instructs the model to emit a sentinel
  token instead of engaging, and the app replaces any response containing it. A client-side check
  alone is bypassable, and this rule isn't allowed to be.
- **No escape hatch.** The support surface has no "continue anyway" button.

---

## Sponsor SDKs — and why each is here

| SDK | What it does in Rehearsly | Why it fits |
|---|---|---|
| **RevenueCat** | Subscription paywall. One `premium` entitlement; one offering with weekly and annual packages. Gates custom scenarios and the 4th+ session in a week. | Free tier gives 3 rehearsals/week on base categories — enough to feel the value. The upgrade moment is the person who's actually preparing for something, which is exactly when unlimited practice is worth paying for. Uses RevenueCat's prebuilt paywall rather than a hand-rolled one. |
| **OneSignal** | Daily practice reminder at a user-chosen time, plus a streak-risk nudge if there's an active streak and no practice by 8pm. Users are tagged with their streak count for segmentation. | Rehearsal only builds confidence if it's repeated. The streak is the product's retention mechanic, so push isn't bolted on — it's what makes the streak mean anything. |
| **Layers** | Onboarding A/B experiment. Variant A: pick a preset scenario first. Variant B: describe your own situation first. Measures first-roleplay completion rate. | Hypothesis: personal relevance drives follow-through, so users who describe their own situation should complete a first rehearsal more often. Assignment is a single seam (`assignVariant` in `src/stores/onboardingStore.ts`) so switching from local coin-flip to Layers changes one function. |

---

## Setup

**Requirements:** Node 20+, npm, an Expo account for device builds. A local Postgres install is
optional (only for running the migration tests).

```bash
git clone https://github.com/<your-username>/rehearsly.git
cd rehearsly
npm install
cp .env.example .env    # then fill in your keys
npm start
```

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Put the project URL and anon key in `.env`.
3. Apply the migrations — either paste each file from `supabase/migrations/` into the SQL editor in
   filename order, or with the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Without Supabase keys the app still boots and is navigable; it shows a configuration notice instead
of crashing.

### Verify the database layer

Runs the migrations against a **throwaway** Postgres cluster and asserts the security model. It
does not touch your Supabase project or any Postgres server you already run.

```bash
./supabase/tests/run.sh
```

Checks: cross-user select/insert/update/delete are all blocked, `anon` has no privilege on user
tables, the scenario catalogue is read-only to clients, every seeded prompt carries the crisis
sentinel, and deleting an auth user leaves no orphaned rows.

### Checks

```bash
npm run typecheck
```

```bash
npm test
```

---

## Tech stack

React Native + Expo (SDK 57) · TypeScript strict · React Navigation · Zustand · NativeWind
(Tailwind) · Supabase (Postgres, Auth, Edge Functions) · OpenAI · RevenueCat · OneSignal · Layers ·
EAS Build

Distribution targets Google Play and the Samsung Galaxy Store.

**Two pinned decisions worth knowing before you touch dependencies:**

- `tailwindcss` is pinned to **v3**. NativeWind 4 breaks on Tailwind v4.
- `babel-preset-expo` is a direct devDependency because SDK 57 nests it under `expo/node_modules`,
  so resolving it by name from `babel.config.js` fails.

---

## License

[MIT](LICENSE)
