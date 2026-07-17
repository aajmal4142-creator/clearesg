# ClearESG — Full Build Plan

> **How to use this file**
> This is the single source of truth for the build. Work through it **phase by phase, in order**.
> After each phase: run `pnpm build`, fix all type errors, commit with the stated message, then update
> the Progress Ledger at the bottom of this file (change `[ ]` to `[x]` and add a one-line note).
> Do not skip ahead. Do not start Phase N+1 until Phase N builds clean and is committed.
> If a decision in this file conflicts with your instinct, follow this file and note the objection in the ledger.

---

## 0. Product Context

**ClearESG** is an ESG compliance platform for small/mid-sized companies and the ESG consultants who serve them.

The thesis: the money is not in "being green." It is in **mandatory reporting law**. The EU's CSRD pulls
~49,000–50,000 companies into required disclosure from 2025–2026. India's SEBI BRSR binds the top listed firms
and is cascading down their supply chains. Demand is regulation-driven, so it survives political swings in ESG
sentiment. Companies do not buy this because they want to; they buy it because a deadline exists.

**Who we sell to (two audiences, one platform):**

1. **SME (direct)** — a 40–400 person company that just learned it must report, either because it fell into CSRD
   scope or because a large customer sent them a supplier questionnaire. Has no sustainability team. The CFO or
   an ops manager got handed this. They are frightened and time-poor. They want to be told exactly what to do.
2. **Consultant (multi-tenant)** — a boutique ESG advisory with 5–40 SME clients, currently drowning in
   spreadsheets. They want to run all clients in one place, white-label the output, and bill for it.
   **The consultant is the growth engine.** Every consultant brings their whole client book. Optimise for them.

**Beachhead:** India/BRSR and the SME tier. Enterprise (Workiva, IBM Envizi, Persefoni, Sphera) is crowded,
sells six-figure contracts, and takes six months to implement. They are not our competitor — they are our
credibility ceiling. We win where they will not go.

**Positioning line:** _Enterprise ESG software costs six figures and takes six months. ClearESG gets you
audit-ready this quarter._

---

## 1. Competitive Gap Analysis — What We Build That They Don't

This section is the reason the product wins. Every feature below is a deliberate answer to a hole in the market.
Do not treat these as optional polish. They are the product.

| #   | Gap in the market                                                                                                           | What ClearESG does                                                                                                                                                                                                                                                                                                 | Why it wins                                                                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Everyone sells a dashboard. Nobody sells a deadline.** Competitors show you data. They don't tell you what happens next.  | **Compliance Runway** — the home screen is not a dashboard, it's a countdown. "You are 87 days from your first CSRD filing. 14 of 31 datapoints collected. At your current rate you will miss it by 22 days."                                                                                                      | Reframes the product from "reporting tool" to "the thing that stops you getting fined." Anxiety is the buying trigger; we address it directly.                  |
| 2   | **Scope 3 is where everyone gives up.** Tools either ignore it or dump a spreadsheet on you.                                | **Supplier Request Chains** — generate a tokenised public link per supplier, they fill a 6-field form with no account, data flows straight into your Scope 3. Track response rates. Auto-chase.                                                                                                                    | Scope 3 is 70–90% of most footprints and the #1 reason SMEs fail an audit. Nobody has made it _easy_. This is the single strongest moat.                        |
| 3   | **Double materiality is a consultancy service, not a feature.** CSRD legally requires it; software makes you do it in Word. | **Guided Double Materiality Workshop** — structured impact × financial scoring across ESRS topics, drag-to-position matrix, auto-generates the assessment narrative and the audit trail of who decided what and when.                                                                                              | This is a €15–40k consulting engagement. Shipping it as software is a category-defining move for the SME tier.                                                  |
| 4   | **Auditors reject reports because there's no evidence trail.** Tools export a PDF and wish you luck.                        | **Evidence Vault** — every single number is clickable back to the uploaded invoice/bill/certificate, with uploader, timestamp, and an immutable hash. Any figure without evidence is visibly flagged.                                                                                                              | Turns "we made a report" into "we made a _defensible_ report." This is what assurance actually costs money for.                                                 |
| 5   | **Emission factors are hardcoded and stale.** Users have no idea if the number is right or which year's factor was used.    | **Versioned Factor Registry** — every factor is a database row with source (DEFRA/EPA/IEA/CEA India), publication year, region, unit, and validity window. Reports pin the factor version used. Recalculate on new factor release with a visible diff.                                                             | Auditors ask "which factor, which year, which source?" Every competitor at this price point fails this question. This is defensibility as a feature.            |
| 6   | **CSRD vs BRSR are treated as separate products.** Nobody serves companies caught by both.                                  | **Enter Once, Map Everywhere** — one canonical datapoint model; frameworks are _views_ over it. Enter electricity once, it satisfies ESRS E1-6 and BRSR Principle 6 simultaneously.                                                                                                                                | Indian subsidiaries of EU parents are a real, growing, badly-served segment. Also future-proofs for ISSB/IFRS S2, CDP, GRI.                                     |
| 7   | **Consultant tooling is an afterthought.** They get "team seats," not a workflow.                                           | **Consultant Command Centre** — all clients in one table sorted by deadline risk, bulk-nudge, reusable data templates by sector, full white-label (their logo/colours/domain on the client portal and the PDF), per-client billing view.                                                                           | The consultant is a distribution channel disguised as a customer. Serve them properly and they onboard 20 SMEs for us.                                          |
| 8   | **Onboarding takes weeks and starts with a blank form.**                                                                    | **60-Second Baseline** — answer 6 questions (sector, headcount, country, revenue band, sites, own/lease), get an _estimated_ footprint and score immediately from sector intensity benchmarks, clearly marked ESTIMATED. Then replace estimates with real data one at a time, watching the confidence meter climb. | Time-to-value goes from weeks to under a minute. The estimate creates an itch: nobody can leave a number marked "estimated" alone. This drives activation.      |
| 9   | **No competitor tells you how you compare.**                                                                                | **Sector Benchmarking** — anonymised percentile vs same-sector, same-size cohort. "Your energy intensity is worse than 71% of manufacturers your size." Requires n≥8 in cohort before displaying.                                                                                                                  | The only feature that gets better as we get more customers — a genuine data network effect. Also the most screenshot-able, most shareable thing in the product. |
| 10  | **Reports are a dead PDF.**                                                                                                 | **Living Report** — versioned, shareable via signed link with an expiry, viewable as a branded microsite with the evidence trail attached, plus the PDF and the XBRL-ready structured export.                                                                                                                      | Buyers/banks/customers asking for your ESG data get a link, not an email attachment. Every share is a marketing impression.                                     |
| 11  | **Data quality is invisible.**                                                                                              | **Confidence Score** — every metric carries measured / calculated / estimated / missing, and the report shows an overall data quality percentage.                                                                                                                                                                  | Auditors _love_ this. It is also honest, which is the brand.                                                                                                    |
| 12  | **Nobody explains WHY the number moved.**                                                                                   | **Narrative Engine** — deterministic, template-based plain-English explanations of every score and every change. "Your E score fell 6 points because diesel use rose 31% while headcount stayed flat."                                                                                                             | Non-experts cannot act on a number. They can act on a sentence.                                                                                                 |

**Anti-features — deliberately NOT building:**

- Full-fat carbon accounting for heavy industry (that's Sphera/Persefoni, we lose)
- Real-time IoT sensor ingestion (wrong segment)
- Live assurance marketplace v1 (later, needs auditor supply)
- An AI chatbot that guesses regulation (liability; the Copilot is scoped and cited only)

---

## 2. Non-Negotiable Technical Decisions

Locked. Do not deviate.

| Layer           | Choice                                                                                   | Notes                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Framework       | **Next.js 16, App Router, TypeScript strict**                                            | Server Components by default. `"use client"` only at interactive leaves.                 |
| CMS/Admin/ORM   | **Payload CMS 3**                                                                        | Runs natively inside the Next app (`(payload)` route group). Not a separate service.     |
| Database        | **MongoDB** via `@payloadcms/db-mongodb`                                                 | Atlas. Never a free M0 tier for anything real — a prior project lost collections on M0.  |
| Auth            | **Clerk**                                                                                | Clerk owns identity. Payload owns authorisation. Sync via webhook. Details in Phase 2.   |
| UI              | **shadcn/ui + Tailwind v4**                                                              | `@theme inline` referencing CSS custom properties so white-labelling works via CSS vars. |
| Animation       | **Motion (`motion/react`)**                                                              | The successor to Framer Motion.                                                          |
| Charts          | **Recharts**                                                                             | Themed via the same CSS vars.                                                            |
| Package manager | **pnpm**                                                                                 |                                                                                          |
| Validation      | **Zod** — single schema, shared client + server                                          |                                                                                          |
| Forms           | **react-hook-form** + zodResolver                                                        |                                                                                          |
| Server state    | **TanStack Query** for client-fetched lists only. Server Components for everything else. |                                                                                          |
| PDF             | **React-PDF (`@react-pdf/renderer`)** rendered in a Node route handler                   | NOT html2canvas. Must be vector, selectable, accessible.                                 |
| Email           | **Resend** + React Email                                                                 |                                                                                          |
| Payments        | **Stripe** — Checkout + Billing Portal + webhooks                                        |                                                                                          |
| Rate limiting   | **Upstash Redis** on all public/unauthed endpoints                                       |                                                                                          |
| File storage    | **UploadThing** or S3-compatible via `@payloadcms/storage-s3`                            | Evidence files.                                                                          |
| Testing         | **Vitest** (unit — calc engine is non-negotiable coverage) + **Playwright** (e2e)        |                                                                                          |
| Deploy          | **Vercel**                                                                               |                                                                                          |

**Node 20+. pnpm. `strict: true`. No `any` — if you reach for it, model the type properly.**

---

## 3. Design Direction

The brief: high-class, heavily animated, and it must be loved more than the competition. Competition here is
enterprise SaaS — Workiva and Persefoni look like 2016 Salesforce. Greenly and Plan A are the modern-startup
default: white, rounded, soft-green, Inter, blob illustrations. **Both are what we are not.**

### The concept: _Instrument_

ClearESG is not a friendly green app. It is a **precision instrument** — a piece of measurement equipment for
people whose job now depends on the reading being right and defensible. Think a Leica light meter, a Braun
calculator, a laboratory oscilloscope, a Bloomberg terminal built by someone with taste. Warm, dense,
confident, absolutely legible, slightly serious. Green is not the theme. **Green is data.**

This is the single most important design decision in the file: **the entire chrome is achromatic.
The only saturated colour on screen is a number that means something.** When you see green, you're looking at
a measurement. That's the signature, and it's why the product feels like an instrument rather than a brochure.

### Tokens

```
Ink            #0B0D0E   near-black, the primary surface in dark; text in light
Slate          #1A1D1F   raised surfaces, cards
Graphite       #3A4044   borders, dividers, disabled
Ash            #8A9299   secondary text, labels
Bone           #E8E6E1   primary text on dark / page background in light
Paper          #F5F3EF   light-mode canvas

-- data colours, used ONLY for measurement, never chrome --
Signal         #00E08A   good / on-track / verified          (the one saturated accent)
Amber          #FFB020   estimated / at-risk / needs evidence
Rust           #FF5C4D   gap / overdue / missing
Ultramarine    #4D7CFF   informational / benchmark cohort line
```

**Rationale for the risk:** an achromatic UI where colour = data is genuinely uncommon in this category and it
does real work — a user can scan a dense page and instantly find every problem, because problems are the only
things that are coloured. It also makes white-labelling trivial: the consultant's brand colour slots into a
chrome that has no colour of its own to fight it.

### Type

- **Display:** `Instrument Serif` — high-contrast, sharp, a little editorial. Used at 48px+ **only**. Hero,
  section openers, the big score. Restraint is the whole point. (The name is a coincidence and a gift.)
- **Body/UI:** `Geist` — neutral, excellent at small sizes, doesn't perform.
- **Data:** `Geist Mono` — **every number in the product is monospaced.** Scores, tonnes, dates, percentages,
  deltas, IDs. This is the tell that you're using an instrument. Tabular figures on, always.

Scale: 12 / 14 / 16 / 20 / 28 / 40 / 64 / 96. Body 16/1.6. Labels 12px, uppercase, `letter-spacing: 0.08em`, Ash.

### Layout

Dense over airy. 8px base grid. Hairline borders (`1px Graphite`), `border-radius: 4px` maximum — this is
equipment, not a pillow. Generous _internal_ padding, tight _external_ gaps. Data tables are first-class
citizens, not an afterthought: sticky headers, monospace columns, right-aligned numerics, zebra via a 2%
lightness shift rather than a different colour.

### Signature element: **The Gauge**

The overall ESG score renders as a **precision instrument dial** — a 240° arc, hairline tick marks every 5
points with labelled majors every 20, a single thin needle, the score in 96px Geist Mono at centre, and a
faint "previous period" ghost needle behind it. On load, the needle **sweeps from 0 past the target, overshoots
by ~4%, and settles** with a spring — the physical behaviour of a real analogue meter. The arc segment behind
the needle fills in the band colour (Rust <45, Amber 45–69, Signal ≥70).

This appears exactly three places: the marketing hero (live, driven by a real interactive demo), the dashboard,
and page 1 of the PDF. Nowhere else. It is the thing people screenshot and the thing they remember.

### Motion

Deliberate, orchestrated, never scattered. Motion is used to communicate _measurement settling_ — things arrive
at their value, they don't just appear.

- **Global:** every transition uses spring physics, not duration-eased CSS. `stiffness: 260, damping: 30` house default.
- **Numbers count up** on enter (`useSpring` + `useTransform`), monospace so nothing reflows.
- **Page load** is an orchestrated stagger: chrome → structure → data, 40ms apart. Never all at once.
- **Charts draw in** — lines trace via `pathLength`, bars grow from baseline.
- **Scroll reveals** on marketing: translateY(16px) + opacity, spring, `once: true`, stagger 60ms.
- **The Gauge** sweep as described. This is the one _bravura_ moment. Everything else is quiet.
- **Hover:** 1px border lightens + 2px lift. Nothing more.
- **`prefers-reduced-motion: reduce` → all of the above become instant state changes.** Non-negotiable, wire it
  into a `useReducedMotion` check in the shared motion config, not per-component.

**Restraint check (Chanel's rule — remove one accessory):** no gradient meshes, no glassmorphism, no floating
blobs, no parallax, no cursor followers, no scroll-jacking, no card tilt. The Gauge is the accessory. Everything
else stays quiet so it lands.

### Copy voice

Direct, technical, calm, never cute. Never apologises. Never says "Oops!" Never uses an exclamation mark.
Errors state what happened and what to do: _"Electricity data missing for Q3. Upload a bill or enter kWh
manually."_ Empty states are instructions, not illustrations: _"No suppliers yet. Add one to start collecting
Scope 3 data."_ Actions are verbs and keep their name through the whole flow — the button that says **Publish**
produces a toast that says **Published**.

---

## 4. Data Model (Payload Collections)

The whole product depends on getting this right. **The core insight: `Datapoint` is canonical and
framework-agnostic. Frameworks are _views_ over datapoints, never storage.** Never write a CSRD field and a
BRSR field for the same underlying fact.

```
Organisation      name, slug, type(company|consultancy), sector(NACE), country, employeeCount,
                  revenueBand, fiscalYearEnd, parentOrg?(rel:self), brand{logo,primaryColor,domain},
                  stripeCustomerId, plan(free|pro|consultant), subscriptionStatus, onboardedAt

Membership        user(rel:Users), organisation(rel), role(owner|admin|contributor|viewer),
                  status(active|invited|revoked), invitedBy, invitedAt, acceptedAt
                  -- ALL access resolves through this. Login ≠ access. Never read role off Clerk.

Users             clerkId(unique,index), email, firstName, lastName, avatarUrl, lastSeenAt
                  -- mirror only. Clerk is source of truth for identity. Payload local auth DISABLED.

ReportingPeriod   organisation(rel), label("FY2025"), startDate, endDate,
                  status(open|locked|published), lockedAt, lockedBy
                  -- locking freezes datapoints. Published reports must be immutable.

Datapoint         organisation(rel), period(rel), metricKey(index), value(number),
                  unit, quality(measured|calculated|estimated|missing),
                  evidence(rel:Evidence, hasMany), source(manual|import|supplier|estimate|api),
                  enteredBy, enteredAt, note
                  -- compound index: {organisation, period, metricKey}

MetricDefinition  key(unique), label, description, unit, category(E|S|G),
                  inputType(number|boolean|select), helpText, exampleSource,
                  frameworkMappings[{framework, datapointRef, required}]
                  -- SEEDED, not user-created. This IS the enter-once-map-everywhere layer.

EmissionFactor    key, label, value(number), unit("kgCO2e/kWh"), scope(1|2|3),
                  source(DEFRA|EPA|IEA|CEA_India|GHGProtocol), sourceUrl, publicationYear,
                  region(ISO2|"GLOBAL"), validFrom, validUntil, supersededBy(rel:self)
                  -- NEVER hardcode a factor. Every calculation resolves a row and pins its ID.

Evidence          organisation(rel), file(upload), filename, mimeType, size,
                  sha256(index), uploadedBy, uploadedAt, linkedDatapoints(rel,hasMany),
                  extractedData(json), ocrStatus(pending|done|failed)

Supplier          organisation(rel), name, contactEmail, category(spendCategory),
                  annualSpend, requestToken(unique,index), requestStatus(not_sent|sent|opened|
                  submitted|declined), sentAt, respondedAt, submittedData(json), reminderCount

MaterialityAssessment  organisation(rel), period(rel), status(draft|final),
                  topics[{esrsTopic, impactScore(0-5), financialScore(0-5), rationale,
                  decidedBy, decidedAt}], matrixSnapshot(json), finalisedAt

Report            organisation(rel), period(rel), framework(CSRD|BRSR|GRI|CUSTOM),
                  version(int), status(draft|published), scores{overall,e,s,g},
                  emissions{scope1,scope2,scope3}, dataQualityPct, factorVersionsUsed[rel],
                  pdfUrl, shareToken(unique), shareExpiresAt, publishedAt, publishedBy
                  -- version increments, never overwrite. A published report is immutable forever.

AuditLog          organisation(rel), actor(rel:Users), action, entityType, entityId,
                  before(json), after(json), ip, userAgent, createdAt
                  -- append-only. No update, no delete hooks. This is what auditors read.

BenchmarkStat     sector, sizeBand, metricKey, period, p25, p50, p75, cohortSize
                  -- computed nightly. NEVER expose if cohortSize < 8.
```

**Access control — implement as Payload `access` functions on every collection:**

- Every read/write filters by `organisation` ∈ user's active Memberships. No exceptions.
- Consultancy orgs see child orgs via `parentOrg`. One level deep only.
- `viewer` cannot write. `contributor` writes Datapoints/Evidence only. `admin` everything but billing +
  member removal. `owner` everything.
- `AuditLog`: create-only, read for admin+, **update/delete denied for everyone including admins.**
- Locked periods reject Datapoint writes at the collection hook, not the UI.

---

## 5. The Calculation Engine

Lives in `lib/calc/`. **Pure functions. Zero I/O. Zero framework imports. 100% unit test coverage — this is the
one place where that's mandatory.** If the maths is wrong the company gets fined and we get sued.

```ts
// lib/calc/types.ts — everything is explicit, nothing is implicit
export type Quality = "measured" | "calculated" | "estimated" | "missing";
export interface Measured {
  value: number;
  unit: string;
  quality: Quality;
  factorId?: string;
}
export interface CalcInput {
  /* all datapoints for a period, keyed by metricKey */
}
export interface CalcResult {
  scores: { overall: number; e: number; s: number; g: number };
  emissions: {
    scope1: Measured;
    scope2: Measured;
    scope3: Measured;
    total: Measured;
  };
  dataQualityPct: number;
  factorsUsed: Array<{
    factorId: string;
    key: string;
    value: number;
    source: string;
    year: number;
  }>;
  breakdown: Array<{
    component: string;
    contribution: number;
    explanation: string;
  }>;
  band: "strong" | "moderate" | "early";
}
```

**Formulas — carried over from the agreed v1 spec. Implement EXACTLY. Do not "improve" them.**

```
Scope 2  = electricity_kWh × factor(grid, region, year) / 1000        → tCO2e
Scope 1  = (diesel_L × factor(diesel) + gas_m3 × factor(gas)) / 1000  → tCO2e
Scope 3  = Σ(supplier_spend × spendFactor(category))  +  Σ(direct supplier-reported)

E = clamp(0, 100,  100 − max(0, carbonPerEmployee − 1) × 12 + renewablePct × 0.15)
S = clamp(0, 100,  min(55, diversityPct / 40 × 55) + max(0, 35 − injuryRate × 8) + trainingBonus)
G = clamp(0, 100,  boardIndependencePct × 0.5 + policyToggleScore)
Overall = round((E + S + G) / 3)
Band: ≥70 strong | 45–69 moderate | <45 early
```

**Hard rules:**

1. **Factors are resolved, never hardcoded.** `resolveFactor(key, region, year)` reads the registry.
   The 0.71 / 2.68 / 1.90 values from the v1 prototype become **seed rows** with source and year, not constants
   in the code. If no factor matches, throw — never silently fall back.
2. **Every result pins `factorsUsed`.** A published report must be reproducible in 5 years.
3. **Missing data never becomes zero.** Zero is a measurement. Missing is `quality: 'missing'` and it lowers
   `dataQualityPct` and is visibly flagged. This distinction is the whole credibility of the product.
4. **`breakdown[]` powers the Narrative Engine.** Every component states its own contribution and a
   template-generated sentence. Deterministic strings, no LLM. e.g.
   `"Diesel contributed 4.2 tCO2e (31% of Scope 1)."`
5. Golden-file tests: `__fixtures__/` holds 12 known input→output cases including all edge cases
   (zero employees, missing everything, 100% renewable, extreme outliers). These must never drift.

---

## 6. Build Phases

Work top to bottom. Commit after each. Update the ledger.

### PHASE 0 — Foundation

- `pnpm create next-app@latest` → TS, App Router, Tailwind, src dir, `@/*` alias.
- Install Payload 3 + `@payloadcms/db-mongodb` + `@payloadcms/richtext-lexical`. Wire the `(payload)` route
  group per Payload 3 Next-native install. Confirm `/admin` renders.
- `shadcn@latest init`. Add: button, input, card, table, dialog, sheet, dropdown-menu, select, tabs, badge,
  toast(sonner), form, tooltip, skeleton, separator, avatar, progress, alert, popover, command, checkbox,
  radio-group, textarea, calendar, scroll-area.
- Tailwind v4 `@theme inline` mapping every token from §3 to CSS custom properties on `:root` and `[data-theme]`.
  **Every colour in the entire app references a var. Zero hex values in components.** This is what makes
  white-labelling work later.
- Fonts via `next/font`: Instrument Serif, Geist, Geist Mono. Preload, `display: swap`.
- `lib/motion.ts` — house spring config + a `useMotionSafe()` hook wrapping `useReducedMotion`.
- ESLint strict, Prettier, Husky + lint-staged, Vitest, Playwright.
- `.env.example` with every var named and commented.
- **Commit:** `chore: scaffold next16 + payload3 + shadcn + design tokens`

### PHASE 1 — Data model

- Every collection from §4 with full field configs, indexes, and validation.
- Access control functions on all of them. Write the Membership resolver in `lib/access/` once, use everywhere.
- Seed script `pnpm seed`:
  - ~60 `MetricDefinition` rows covering E/S/G with real framework mappings
  - `EmissionFactor` rows: DEFRA 2024 (UK), EPA 2024 (US), IEA 2024 (EU avg), CEA 2024 (India grid), plus
    spend-based Scope 3 factors by category. **Each with a real sourceUrl.**
  - 3 demo orgs (SME manufacturer, SME services, consultancy with 4 child clients) with a full year of
    realistic datapoints — the seed must produce a product that looks alive on first run.
- Vitest on access control: a user from org A must not read org B. Prove it.
- **Commit:** `feat: payload collections, access control, seed data`

### PHASE 2 — Auth

Clerk owns identity. Payload owns authorisation. They meet in exactly two places.

- Clerk `<ClerkProvider>`, middleware, sign-in/up pages **styled with our tokens** (Clerk `appearance` prop —
  do not ship default Clerk purple).
- Payload `Users`: local auth **disabled**. `clerkId` unique+indexed.
- **Webhook** `/api/webhooks/clerk` — verify with svix, handle `user.created|updated|deleted`, upsert the
  Payload `Users` mirror. Idempotent.
- **`getCurrentContext()`** in `lib/auth/` — the single function every server component and route handler calls.
  Returns `{ user, memberships, activeOrg, role }` or redirects. React `cache()` wrapped so it's free to call
  repeatedly in one render. **Nothing else reads auth state.**
- Org switcher in the shell reading Memberships. Active org in a signed httpOnly cookie, **re-validated against
  Membership on every request** — never trust the cookie alone.
- Invite flow: `owner|admin` invites by email → Membership `status: invited` → Resend email → accept links
  Clerk user to the pending Membership.
- **Commit:** `feat: clerk auth, membership authorisation, org switching, invites`

### PHASE 3 — Calculation engine

- `lib/calc/` exactly per §5. Pure. No imports from `next` or `payload`.
- `resolveFactor()` with the region/year fallback ladder: exact region+year → region+latest → GLOBAL+year →
  **throw**. Never silently default.
- The 12 golden fixtures. `pnpm test:calc` must be green and must stay green forever.
- Narrative Engine `lib/narrative/` — deterministic templates keyed off `breakdown[]`. Include the delta
  narratives ("fell 6 points because…") which need the previous period as an argument.
- **Commit:** `feat: calculation engine + factor registry + narrative engine, 100% covered`

### PHASE 4 — Onboarding: the 60-Second Baseline

The activation moment. Get this wrong and nothing else matters.

- 6 questions, one per screen, spring-transitioned horizontally. Progress as a hairline bar, not a stepper.
- Sector intensity benchmarks (seeded) → instant estimated footprint + estimated Gauge reading.
- **The Gauge sweeps for the first time here.** This is the moment they decide if they like us.
- Every estimated figure carries an Amber `ESTIMATED` chip and a "Replace with real data" affordance.
- Ends on the Compliance Runway with real deadline maths from their country + sector + fiscal year end.
- **Commit:** `feat: 60-second baseline onboarding`

### PHASE 5 — The Compliance Runway (home)

Not a dashboard. A countdown.

- Days-to-deadline, monospace, 96px, counts up on load.
- Datapoints collected / required, with the **projected miss** calculation from current velocity.
- The Gauge with the ghost needle for previous period.
- Next 3 actions, ranked by (impact on score × ease). Each is one click to the exact form field.
- Scope 1/2/3 stacked bar that draws in.
- Recent activity from AuditLog.
- **Commit:** `feat: compliance runway dashboard`

### PHASE 6 — Data collection

- The metric wizard: grouped by category, autosave on blur (optimistic, with rollback on failure), inline unit
  conversion (kWh/MWh/GJ), and a **quality selector on every field** — the user must actively say whether a
  number is measured or estimated.
- Evidence upload: drag-drop, sha256 on the client before upload, link to datapoints, preview inline.
- CSV import with column mapping UI + dry-run diff before commit.
- **Every field shows its framework mappings** — "this satisfies ESRS E1-6 and BRSR P6 Q1." This is the
  enter-once-map-everywhere promise made visible, and it's the moment users understand why we're different.
- **Commit:** `feat: data collection wizard, evidence vault, csv import`

### PHASE 7 — Supplier chains (the moat)

- Supplier CRUD + spend categories.
- **Public tokenised form** `/s/[token]` — no account, 6 fields, mobile-first, ~90 seconds to complete,
  rate-limited hard, token single-use with expiry, branded to the _requesting_ org.
- Request email via Resend + React Email. Auto-reminder at day 7 and 14. Response-rate tracking.
- Submitted data → Datapoints with `source: 'supplier'`, `quality: 'measured'`, flows into Scope 3.
- Coverage meter: "% of spend covered by supplier-reported data" — the number that gets them past an audit.
- **Commit:** `feat: supplier request chains + public collection form`

### PHASE 8 — Double materiality

- ESRS topic list seeded.
- Guided scoring: impact severity/scope/irremediability + financial magnitude/likelihood, per topic.
- Drag-to-position matrix (Motion drag + spring). Quadrant thresholds. Material topics highlighted in Signal.
- Auto-generated narrative + full decision audit trail (who scored what, when, why).
- Export as report appendix.
- **Commit:** `feat: double materiality workshop`

### PHASE 9 — Reports

- React-PDF templates: CSRD and BRSR. Cover with the Gauge, exec summary, scores, emissions, data quality,
  materiality matrix, evidence index, factor versions appendix. **Vector, selectable, tagged, brand-themed.**
- Living Report: share token → branded microsite, optional expiry, view analytics.
- Versioning: publish snapshots everything and locks it. Immutable. Diff view between versions.
- Structured export (JSON + CSV) shaped for XBRL later.
- **Commit:** `feat: pdf reports, living report sharing, versioning`

### PHASE 10 — Consultant Command Centre

- Client table sorted by deadline risk, with per-client Gauge sparkline.
- Bulk actions: nudge, assign template, export all.
- Sector templates: reusable datapoint sets.
- **White-label:** logo, primary colour, custom domain → injected as CSS vars server-side on `<html>`.
  Applies to portal AND PDF.
- Per-client billing view.
- **Commit:** `feat: consultant command centre + white-label`

### PHASE 11 — Benchmarking

- Nightly job → BenchmarkStat.
- **Hard gate: never render a cohort with n < 8.** Enforce in the query, not the component.
- Percentile display with a distribution curve, the user's position marked.
- "How to improve" links to the highest-leverage actions.
- **Commit:** `feat: sector benchmarking`

### PHASE 12 — Billing

- Stripe Checkout, Billing Portal, webhooks (`checkout.session.completed`, `customer.subscription.*`,
  `invoice.payment_failed`).
- Plans: **Free** €0 (1 org, 1 period, watermarked PDF) / **Pro** €49/mo (unlimited periods, full PDF,
  10 suppliers, evidence vault) / **Consultant** €199/mo (10 clients, white-label, bulk, +€15/client after).
- Entitlement checks server-side in `lib/billing/can()`. Never gate in the UI only.
- Usage meters in-app before the limit bites.
- **Commit:** `feat: stripe billing + entitlements`

### PHASE 13 — Marketing site + SEO/AEO

See §7. This is where revenue actually comes from.

- **Commit:** `feat: marketing site, programmatic seo, aeo`

### PHASE 14 — Hardening

- Playwright: signup → onboard → enter data → invite supplier → publish report → share link.
- Rate limits on every public endpoint.
- Sentry. Structured logging. Health check.
- a11y: axe clean, keyboard-complete, focus visible, contrast ≥ 4.5:1, reduced-motion honoured everywhere.
- Lighthouse ≥ 95 across the board on marketing pages.
- **Commit:** `chore: hardening, e2e, a11y, perf`

---

## 7. SEO & AEO

Two different jobs. **SEO** = rank in Google. **AEO** (Answer Engine Optimisation) = get _cited_ by ChatGPT,
Claude, Perplexity, and Google AI Overviews. Our buyer is a panicking CFO who asks an LLM _"do I have to comply
with CSRD?"_ before they ever open Google. **If we are not the answer to that question, we lose the deal before
it exists.** AEO is the higher-leverage of the two for this product. Build for it deliberately.

### Technical SEO — the floor

- Metadata API on every route. Unique title + description. Never a template default.
- `opengraph-image.tsx` per route — dynamic OG images rendered with `ImageResponse`, in our tokens, showing
  real content (e.g. the Gauge with that page's number).
- `sitemap.ts` dynamic (includes every programmatic page), `robots.ts`.
- Canonicals on everything. `hreflang` for en-GB / en-IN — different regulation, genuinely different pages, not
  a translation.
- **Static-render every marketing and content route.** No client-side data fetching above the fold, ever.
- Core Web Vitals: LCP < 1.8s, INP < 100ms, CLS < 0.05. **The animations must not cost CWV** — transform and
  opacity only, `will-change` sparingly, never animate layout properties. Test on throttled mobile.
- Breadcrumbs with schema on all content.
- Internal linking: every glossary/answer page links to ≥3 siblings and 1 product page. No orphans.

### Structured data — JSON-LD on every page

`Organization`, `SoftwareApplication` (+ `AggregateRating` once real, +`Offer` with the real prices),
`FAQPage`, `HowTo`, `Article` (with `author` + `datePublished` + `dateModified`), `BreadcrumbList`,
`DefinedTerm` + `DefinedTermSet` for the glossary, `Dataset` for the factor registry.

### AEO — how to actually get cited

LLMs cite sources that are **extractable, specific, attributed, dated, and unique**. Optimise for the crawl.

1. **Answer-first structure.** Every content page opens with a `<p>` under the H1 that answers the question
   in 40–60 words, standalone, no preamble. That paragraph is what gets lifted. Everything else is support.
2. **One question per H2.** Phrased exactly as a human asks it. _"Does CSRD apply to companies outside the EU?"_
   not _"Scope considerations."_
3. **Facts carry a number, a date, and a source.** _"CSRD applies to ~50,000 companies (European Commission,
   2024)."_ Unsourced claims don't get cited.
4. **`llms.txt` at root** — a plain-markdown map of the site, what ClearESG is, what we're authoritative on,
   and the canonical URLs for each topic. Plus `llms-full.txt` with the full glossary + answer corpus inlined.
5. **Never gate content.** No email wall, no JS-rendered text, no accordion-hidden answers. If a crawler can't
   read it, it doesn't exist. Accordions must render their content in the DOM open and collapse with CSS only.
6. **Publish original data.** LLMs cite primary sources over aggregators. Our annual _SME ESG Readiness Index_
   (from anonymised aggregate benchmark data, n≥8 cohorts only) is a _citable primary statistic that only we
   have._ This is the single highest-leverage AEO asset in the plan — build it the moment there's data.
7. **Comparison pages get cited constantly** because LLMs are asked "what's the best X." Write them honestly,
   including where competitors are genuinely better. Honesty is both the brand and, mechanically, what makes a
   comparison page trustworthy enough to cite.
8. Author bylines with real credentials + `sameAs` to LinkedIn. E-E-A-T is an AEO signal now, not just SEO.
9. `dateModified` accurate and recent. Stale pages don't get cited on a regulation that changes.

### Programmatic content — the traffic engine

Generated from real seeded data, not spun. Every page must be genuinely useful standing alone.

| Template                     | Count | Pattern                                                                  | Intent     |
| ---------------------------- | ----- | ------------------------------------------------------------------------ | ---------- |
| `/csrd/[sector]`             | ~40   | "CSRD compliance for [sector]" — real ESRS datapoints for that NACE code | high       |
| `/brsr/[sector]`             | ~30   | Same for BRSR principles                                                 | high       |
| `/glossary/[term]`           | ~150  | Scope 3, double materiality, ESRS E1, SAS… `DefinedTerm` schema          | discovery  |
| `/answers/[question]`        | ~120  | Long-tail exactly as asked. Answer-first. **The core AEO asset.**        | discovery  |
| `/emission-factors/[region]` | ~25   | Live from the factor registry, `Dataset` schema, with sources            | authority  |
| `/compare/[competitor]`      | ~12   | vs Workiva, Persefoni, Greenly, Plan A, Sweep, Watershed…                | high       |
| `/deadlines/[country]`       | ~28   | Live countdown per jurisdiction. Updates itself.                         | high       |
| `/tools/[calculator]`        | ~8    | Free calculators. **Ungated.** See below.                                | conversion |

**Free ungated tools** — the best acquisition asset we have, because each is independently linkable, citable,
and shareable:

- CSRD scope checker (3 questions → "yes, you're in scope from FY2026")
- Scope 2 calculator (kWh → tCO2e, region-correct factor, cites the source)
- Double materiality starter matrix
- Supplier questionnaire generator
- BRSR readiness score

Each ends with **"Save this and track it over time →"**. That's the conversion. No email gate before the answer
— the answer _is_ the marketing.

---

## 8. Growth Mechanics Built Into The Product

Not marketing bolted on afterward. These are features that happen to compound.

1. **Supplier chain = viral loop.** Every supplier request is a branded touch to another SME who _also_ now
   has an ESG problem. Footer of the form: "Need to report your own emissions? ClearESG →". This is the
   highest-conversion channel in the product because the recipient has just been reminded they have the exact
   problem we solve.
2. **Living Report = distribution.** Every shared report is a branded page seen by banks, buyers, auditors.
3. **Consultant tier = channel.** One consultant onboards 20 SMEs. Land consultants and the SMEs come free.
   Consider a revenue share for consultant-referred direct upgrades.
4. **Free tools = citation surface.** Ungated, linkable, LLM-citable.
5. **Benchmark = data network effect.** Genuinely better with every customer. Competitors can't copy it
   without our customer base.
6. **SME ESG Readiness Index = annual press moment + permanent citable stat.**
7. **Free tier is real, not crippled.** Full calculation, watermarked PDF. Cripple the _output_, never the
   _insight_ — a user who gets a real answer and can't share it will pay. A user who gets a fake answer leaves.

---

## 9. Definition of Done — every phase

- [ ] `pnpm build` clean. Zero TS errors. Zero `any`.
- [ ] Zero hardcoded hex — all colour via CSS var.
- [ ] Every number monospaced, tabular figures.
- [ ] Loading (skeleton), empty (instructional), error (actionable) states for every async surface.
- [ ] Mobile 375px → desktop 1920px.
- [ ] Keyboard complete. Focus visible. axe clean.
- [ ] `prefers-reduced-motion` honoured.
- [ ] Server-side authorisation on every mutation — never UI-only.
- [ ] Copy per §3 voice: no exclamation marks, no "Oops", verbs keep their names.
- [ ] Committed with the stated message.

---

## 10. Progress Ledger

Update after every phase. This is how you resume if context is lost.

| Phase               | Status | Notes                                                                                                                                                                                                    |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Foundation      | [x]    | Next 16.2.10 + Payload 3.86 + shadcn + tokens; sharp cast for types; /admin needs real DATABASE_URL (no local Mongo yet).                                                                                |
| 1 — Data model      | [x]    | 1a+1b done. 1c Step 2: 1201 DPs. Step 3: all 6 raw E→ESRS candidates rejected — no 1:1. Derivation layer + DerivedMetricDefinitions hold approved E1-5 mappings. BRSR/VSME skipped.                      |
| 2 — Auth            | [x]    | Clerk identity + Membership authz; webhook; org switch; invites API; CLEARESG_DEV_BYPASS when keys absent.                                                                                               |
| 3 — Calc engine     | [x]    | Pure calc + factor resolve ladder + narrative; 70 tests via test:calc; missing ≠ zero.                                                                                                                   |
| 4 — Onboarding      | [x]    | 60-second baseline wizard; writes org profile + ComplianceObligations; redirects to Runway when onboardedAt set.                                                                                         |
| 5 — Runway          | [x]    | Days-to-filing countdown, collection progress, Gauge placeholder, next actions; CountUp + reduced-motion.                                                                                                |
| 6 — Data collection | [x]    | Wizard for 18 metrics + quality; evidence vault (sha256); CSV dry-run; raw→ESRS notes via derive registry only.                                                                                          |
| 7 — Supplier chains | [x]    | CRUD + spend categories; /s/[token] 6-field public form (single-use, expiry, rate-limit); reminders day 7/14; coverage meter; supplier_reported_tco2e → Scope 3. Email via console adapter until Resend. |
| 8 — Materiality     | [x]    | ESRS topics E1–E5/S1–S4/G1; impact+financial scoring; drag matrix; narrative + audit; /app/materiality.                                                                                                  |
| 9 — Reports         | [x]    | Immutable snapshot publish; React-PDF; living /r/[token]; JSON/CSV; version diff; assurance disclaimer.                                                                                                  |
| 10 — Consultant CC  | [x]    | Client table by deadline risk; bulk nudge/export; sector templates; white-label BrandVars; /app/consultant + /api/app/consultant/*.                                                                      |
| 11 — Benchmarking   | [x]    | Percentiles + n≥8 hard gate; recompute API; demo cohort when empty; /app/benchmarks.                                                                                                                     |
| 12 — Billing        | [x]    | Stripe Checkout/Portal/webhooks; `lib/billing/can()`; usage meters; Free watermark PDF; DEV bypass upgrade when keys absent.                                                                             |
| 13 — Marketing/SEO  | [x]    | Home+Gauge, pricing, glossary/answers/tools/csrd/compare/deadlines; sitemap/robots; llms.txt; JSON-LD; OG image. Seed corpus (expandable).                                                               |
| 14 — Hardening      | [x]    | Health `/api/health`; Upstash/memory rate limits; Sentry init when DSN set; structured logs; focus-visible + reduced-motion; Playwright + axe smoke.                                                     |

---

## 11. Open Decisions — ask, don't assume

Flag these to the human rather than guessing:

1. **Emission factor licensing.** DEFRA is open. IEA and some EPA datasets are not freely redistributable.
   Seed with open factors only; flag any that need a licence before commercial use. **This is a legal risk,
   not a technical one.**
2. **Region/currency.** Pricing is in EUR here. India needs INR and Razorpay — Stripe's India support for
   recurring is poor. Confirm before Phase 12.
3. **DPDP Act (India), enforceable May 2027** — data residency may be required for Indian customers. Affects
   Atlas region choice. Confirm before shipping to India.
4. **We are not an assurance provider.** Every report needs a visible disclaimer. Get it reviewed.
5. **Benchmark consent.** Aggregate use of customer data needs to be in the ToS from day one, opt-out available.
