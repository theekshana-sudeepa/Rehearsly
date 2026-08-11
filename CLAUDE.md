# Rehearsly — Project Brief & Agent Instructions

> This file is the durable build contract for Rehearsly. It is loaded every session.
> Target: **RevenueCat Shipaton 2026**, submission deadline **Sept 30, 2026** (submit by **Sept 25**).

---

## 1. Mission

Build **Rehearsly**, a mobile app that lets people rehearse hard conversations — workplace
feedback, setting boundaries, saying no, difficult family talks — with an AI roleplay partner,
then get structured feedback so the real conversation feels familiar instead of frightening.

This is a competition entry with a hard deadline. Ship a working, polished, **narrow** product.
Do not scope-creep. A small app that works perfectly beats a big app that's half broken in the
demo video.

**Non-negotiable:** brand-new app, never previously published. Do not reuse, rebrand, or lightly
modify any existing project. First public store release must fall between Aug 1 – Sept 30, 2026.

## 2. Product voice & safety

The founder runs LexoraTech (web/software agency) and previously delivered a mental-wellness
platform (Inner Mental Wellness) for a client. Rehearsly extends that domain expertise into a
personal product.

- Tone: **warm, non-clinical, practical**. A confidence-building tool, not a therapy app.
- Never imply it replaces professional mental health support.
- **Crisis intercept (hard rule):** if a user's scenario input or message suggests crisis-level
  distress (self-harm, abuse, suicidal ideation), the app must NOT roleplay it. Show a gentle
  message directing them to real support instead of generating content. This shipped from day
  one and is never relaxed for the sake of a smoother demo.

## 3. Tech stack (fixed — do not substitute without explicit sign-off)

| Layer | Choice |
|---|---|
| Framework | React Native + Expo (managed → prebuild when native SDKs demand it) |
| Language | TypeScript, **strict mode**, zero errors |
| Navigation | React Navigation (native stack + bottom tabs) — **not** Expo Router |
| State | Zustand |
| Styling | NativeWind (Tailwind for RN) |
| Backend | Supabase (Postgres + Auth + Edge Functions + Storage) |
| AI | OpenAI API (`gpt-4o-mini` for roleplay + feedback; escalate only if quality demands) |
| Payments | **RevenueCat SDK** — required hackathon dependency |
| Push / retention | **OneSignal SDK** — required |
| Growth experiments | **Layers SDK** — required |
| Distribution | Google Play (primary) + Samsung Galaxy Store (secondary). **Skip Apple App Store** — $99/yr is unnecessary cost |
| CI/Build | EAS Build (free tier) |

Every substitution costs build time we don't have. Flag, don't silently swap.

**Pinned gotchas**
- NativeWind v4 requires **tailwindcss v3.x** — v4 breaks it. Keep `tailwindcss@^3.4`.
- `OPENAI_API_KEY` is **server-side only**, never in the client bundle. All AI calls route
  through a Supabase Edge Function.

## 4. Product spec

### 4.1 Core loop (must be flawless in the demo video)
1. **Pick a scenario** — preset category or free-text custom situation.
2. **Roleplay** — chat UI. AI plays the other person, in character, with realistic emotional
   resistance (not cartoonishly difficult, not trivially easy).
3. **End session** — "End & get feedback" available any time; auto-suggest wrapping after ~10 exchanges.
4. **Feedback** — Clarity / Empathy / Assertiveness / Confidence scored 1–5, 2–3 concrete
   actionable tips, one thing they did well.
5. **Streak** — consecutive practice days build a visible streak. This is the retention hook
   that justifies OneSignal.

### 4.2 Scenario categories (seed into `scenarios`)
- Workplace feedback (giving and receiving)
- Setting boundaries
- Saying no without guilt
- Difficult family conversations
- **Career coaching / new-manager conversations** (maps to the Influencer Award brief: giving
  critical feedback, addressing lateness, saying no to scope creep)
- Custom (free text → AI-generated roleplay persona)

### 4.3 Screens
1. **Onboarding** (2–3 screens) — TWO variants for the Layers experiment. A: "pick a scenario
   first." B: "describe your situation first." Instrument which leads to a completed first roleplay.
2. **Auth** — Supabase email/password or magic link; guest mode if time allows.
3. **Home / Dashboard** — streak counter, "Practice today" CTA, recent sessions.
4. **Scenario picker** — category grid.
5. **Custom scenario input** — free text → system prompt.
6. **Roleplay** — chat bubbles, typing indicator, always-visible "End & get feedback".
7. **Feedback** — scores + tips, "Practice again" / "Back to home".
8. **Progress / history** — past sessions, streak calendar.
9. **Paywall** — RevenueCat `RevenueCatUI.presentPaywall()` (prebuilt, do not hand-build).
10. **Settings** — notification toggle, account, delete-my-data.

### 4.4 Monetization (RevenueCat)
- **Free:** 3 roleplay sessions/week, base categories only.
- **Premium:** unlimited sessions, all categories incl. custom, feedback history/trends.
- Offerings + Entitlements used correctly: one entitlement `premium`, one offering with two
  packages (weekly, annual — annual discounted).
- Gate custom scenarios and >3 sessions/week on `premium` via `Purchases.getCustomerInfo()`.

### 4.5 Retention (OneSignal)
- Minimum one deployed campaign; build a real journey:
  - Daily reminder at a user-chosen time: *"Ready to practice today's conversation?"*
  - Streak-risk nudge: no practice by 8pm + active streak → *"Don't lose your streak — 2-minute practice?"*
- Tag users with streak count as a custom property for future segmentation.

### 4.6 Growth experiment (Layers)
- SDK installed and **verified installed before judging** (stated rule — do not skip).
- **Hypothesis:** users who describe their own situation first (Variant B) complete their first
  roleplay at a higher rate than those who pick a preset first (Variant A), because personal
  relevance drives follow-through.
- Instrument: variant assignment + first-roleplay-completion event.
- Document the result honestly in the writeup. A null result is fine — they reward the
  experiment, not the number.

### 4.7 AI prompt design (real prompts in code, never left as TODO)
**Roleplay system prompt** must include: persona matching the scenario (e.g. "You are Alex, a
colleague who has been missing deadlines and gets defensive when confronted"); stay in character,
realistic emotional nuance, never break the fourth wall; never generate content responding to
indicators of self-harm, abuse, or crisis — return a fixed safe-response token the app intercepts
and replaces with a support message.

**Feedback system prompt** must: take the full transcript; return **structured JSON**
`{clarity, empathy, assertiveness, confidence, whatWorked, tips[]}` so rendering needs no fragile
text parsing; be encouraging and specific — never generic, always tied to something the user
actually said.

## 5. Data model

Supabase Postgres, created as **real migrations**. RLS enabled on all tables: users read/write
only their own `profiles` and `sessions`; `scenarios` is public-read. See
`supabase/migrations/`.

## 6. Secrets

`.env.example` lists every variable with dummy placeholders. Never commit real keys.

## 7. Repository requirements (Next Gen Award)

- Public repo.
- OSS license file at root (MIT) **and** set via GitHub repo settings so it's detected and shows
  in the About section — Devpost's rule is that it must be visible at the top of the repo page.
- README: what the app does, architecture overview, setup instructions, which sponsor SDKs are
  integrated and why (RevenueCat, OneSignal, Layers).
- Commit history must look like real incremental work — no single giant commit. This also feeds
  the #BuildInPublic authenticity signal.

## 8. Definition of done

- [ ] Fresh Expo app, TypeScript strict, zero errors
- [ ] Supabase auth working (signup, login, logout)
- [ ] Onboarding A/B assignment working and logged
- [ ] Full roleplay loop end-to-end on a real device
- [ ] Feedback screen renders structured scores + tips reliably (test ≥5 transcripts)
- [ ] Crisis-content safety intercept tested and working
- [ ] RevenueCat paywall triggers at free-tier limit; sandbox purchase completes
- [ ] OneSignal campaign configured; test notification received on a real device
- [ ] Layers SDK installed, verified in their dashboard, experiment running
- [ ] Published to Google Play (internal testing minimum, ideally production)
- [ ] Published to Samsung Galaxy Store
- [ ] App icon 1024×1024 + ≥1 screenshot 1179×2556 (no device frame)
- [ ] Demo video <2 min, recorded, uploaded to YouTube, publicly viewable
- [ ] Repo public, licensed, README complete
- [ ] Devpost fields filled with real content, no placeholders

## 9. Build phases (hard checkpoints)

| Week | Dates | Deliverable |
|---|---|---|
| 1 | Aug 11–17 | **Scaffold.** Expo init, TS config, NativeWind, navigation shell, Supabase + auth, design tokens. Empty-but-navigable app on a real device by end of week. |
| 2 | Aug 18–24 | **Core loop.** Scenario picker, roleplay chat, OpenAI Edge Function, first end-to-end roleplay (placeholder feedback OK). |
| 3 | Aug 25–31 | **Feedback + paywall.** Structured feedback, RevenueCat, free-tier gating, sandbox purchases. |
| 4 | Sep 1–7 | **Retention + store submission.** OneSignal + first campaign. **Submit to Google Play and Galaxy Store this week** — review takes days. |
| 5 | Sep 8–14 | **Growth experiment.** Layers SDK, onboarding A/B live, completion event instrumented, collecting real signal. |
| 6 | Sep 15–21 | **Polish.** Device-testing bug fixes, screenshots, icon, README, safety-intercept testing. |
| 7 | Sep 22–30 | **Submission.** Demo video, Devpost story, every category field. Submit by **Sept 25**. |

## 10. Working agreement for the coding agent

- Work in small, testable increments. After each phase, produce a runnable build — never leave
  the app broken overnight.
- Prefer boring, well-documented libraries over clever ones.
- **Flag immediately** (don't silently work around) if: an SDK requires a paid tier; a native
  module requires leaving Expo managed workflow in a way that risks the timeline; or a step looks
  likely to blow past a week's checkpoint.
- The crisis-content safety intercept is a hard rule.
- All code, comments, and README content in English (Devpost requires English submissions).
- When a product decision isn't covered here, default to the simplest version that still
  satisfies the Definition of Done. Do not gold-plate unjudged features.
