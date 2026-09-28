# Handoff: Media Advisory Board

_Last session: 2026-09-28 (Mac). The Linear cleanup is done: one ticket per idea, in the glossary's words. Stickers were pushed to 2.0._

## Start here

**Linear is the source of truth, not this document.** The Linear MCP server is authenticated. Read these before touching code:

| Ticket | What it is |
|---|---|
| **WAB-13 Glossary** | The vocabulary. Use these words in UI copy and tickets |
| **WAB-14 Adventure Page** | The key page. Everything else hangs off it. Has a "Decisions from the mockup review" section |
| WAB-15 Media Context Page | The page for a single piece of media: rate it or pass on it |
| WAB-8 Sherpa Recommendation System | Now an overview. Its sub-tickets are WAB-16 to WAB-24 |
| WAB-16 to WAB-24 | Media Search, Recommend to a Nomad, Reasons, Ranking, Rating, Pass, Sherpa Score, Media Scoring, Tagging and Filtering (later) |
| WAB-9, 10, 11, 30 | Fellow Nomads: add, accept or decline, open a nomad's Adventure Page, remove or block |
| WAB-6, WAB-29 | Log In, Sign Up |
| **WAB-25 Schema Reconciliation** | The table of where the schema disagrees with the tickets. Blocks WAB-17 to WAB-21 |
| WAB-31 Theme Colors | Every color from a named role in one theme file |
| **WAB-32 Typecheck and lint are failing** | High. Do first: nothing counts as done until these pass |
| WAB-26, WAB-28 | Bugs: new functions callable by anon (parked for now), `touch_list_entry` search_path |
| WAB-27 Stickers (2.0) | Backlog. Not in the first release |

Closed: WAB-12 Sherpa Page (duplicate of WAB-14), WAB-7 landing page (archived on purpose), WAB-1 to WAB-4 (Linear's samples, canceled).

The Adventure Page mockup: https://claude.ai/artifact/2kVf1bEuKMdUR9h8p14bAA (attached to WAB-14).

### Next task: WAB-32, then WAB-25

Get `npx tsc --noEmit` and `npx expo lint` passing (see "Environment state" below). Then the schema reconciliation, test-first.

## What this is

Friends recommend movies, series and books to each other. Your friends know what you'll actually connect with. The product is the recommendation itself, and eventually knowing *whose* recommendations are reliably right for you. It should feel like an adventure between two friends: a community with zero advertising.

## Vocabulary (from WAB-13)

| Term | Meaning |
|---|---|
| **Sherpa** | The user giving the recommendation |
| **Pilgrim** | The user receiving it. Every user is both, with different friends |
| **Fellow Nomad** | A friend. The Fellow Nomads List is how you reach everyone |
| **Adventure Page** | The page between you and one fellow nomad. Only the two of you, nobody else |
| **Ranking** | The sherpa's order of their list, 1 to 5 |
| **Rating** | 1 to 5 stars, given once you've finished something |
| **Pass** | "Will not consume". The pilgrim declines, with a reason |
| **Reasons** | Why the sherpa recommends it. Private to that pilgrim |
| **Sherpa Score** | How good a sherpa is for one specific pilgrim. Formula not decided |
| **Media Scoring** | What to consume next, drawn from your best sherpas. Not decided |
| **Media Context Page** | The page for one piece of media, in the context of two people |

## The model

From WAB-13, WAB-14 and WAB-15. Where this contradicts the schema, the tickets win.

- A recommendation goes from one sherpa to one pilgrim, for one piece of media.
- **The list belongs to the sherpa.** There's one list per sherpa, per pilgrim, per media type: "Eben's book list for Jake". Eben curates and orders it. Jake can't edit it.
- **Hard cap of 5 per list.** Not a view of a longer list. The point is to avoid analysis paralysis.
- The sherpa can add, remove, reorder and update reasons at any time.
- **Reasons are one-off, per recommendation**, and private to that pilgrim.
- **The pilgrim rates what they've finished, or passes with a reason.** The sherpa sees the pass and its reason, to help craft future picks. A pass doesn't count against the sherpa's score, since the pilgrim never gave it a chance.
- **Both nomads can rate the same media.** The Adventure Page history shows the sherpa's rating and the pilgrim's rating side by side. The recommendation lists only show the pilgrim's rating.
- **The Adventure Page is private to the pair.** No other users' recommendations, ratings or history. Its history only covers media between the two of them. Other views will have their own history.
- Adding a recommendation happens mainly through the search on the Adventure Page, scoped to the tab's media type.
- Either list on the Adventure Page can be collapsed.
- **Media types:** movies ship first, then series. The glossary also lists books, games, music and podcasts.
- Sherpa Score is per pair and directional: Eben can be great for Mike and bad for Jake.

## Where the schema contradicts the model

None of this is done. It's the reconciliation backlog.

| Tickets say | Schema has | Change needed |
|---|---|---|
| No accept/dismiss, but the pilgrim can pass with a reason | `recommendation_status` enum, `accept_recommendation`, `dismiss_recommendation` | Drop the enum, `status`/`responded_at` and both RPCs. Add a pass (reason required, pilgrim-only), readable by the sherpa |
| Sherpa orders their list | No ordering on `recommendations` | Add fractional `position double precision` scoped `(from_user, to_user, media_type)`, sherpa-writable. The pattern exists in `watchlist_items.position` |
| Max 5 per list | No limit | Enforce in the database for `(from_user, to_user, media_type)`, with a pgTAP test for the 6th insert failing |
| Reasons are one-off | `reasons` keyed `(author_id, recipient_id, lower(text))` plus a `recommendation_reasons` join, built for reuse | Collapse so reason text hangs off the recommendation. Drops `upsert_reason` |
| Pilgrim can't change the list | `list_entries` is the hub; recommendations point at it | Invert: the sherpa-owned list becomes the hub. A user's own list stays a separate thing |
| Both nomads rate; history shows both | `list_entries.rating smallint CHECK 1..5`, one row per user+media | The column is right. RLS must let a nomad read the other's rating, but only for media recommended between the two of them. Test that a third user can't |
| Reasons private per pilgrim | RLS on `reasons` enforces it, with passing tests | Already correct. Preserve it through the collapse |
| Stickers are a 2.0 feature (WAB-27) | `stickers`, `recommendation_stickers`, 16 seeded built-ins | Drop both tables and their policies, and the sticker assertions in the tests |

**Rewriting this touches `supabase/tests/database/recommendations.test.sql`** (48 assertions, many about accept/dismiss and reason reuse). Expect to delete and rewrite a good portion of it. `friendships.test.sql` is unaffected.

## What's solid and should not be restarted

- **Friendships**: all six RPCs, plus `are_friends`, with 41 pgTAP assertions. Crossed requests, decline masking, one-sided blocks. Nothing in the tickets contradicts any of it.
- **Reason privacy**: enforced in RLS and tested.
- **Profiles, media_items**, and the `handle_new_user` trigger.
- **Test tooling** across all three layers, and this machine's setup.
- Two bugs already found and fixed by tests: `20260925000000_lock_down_functions.sql` (`are_friends` leaked any two users' status; `anon` could call every function) and `20260925000001_reason_text_only_updates.sql` (an author could move a reason to a stranger).

## Known bugs, still open

- **New functions are callable by `anon` (WAB-26, parked).** An earlier version of this doc had it backwards. `authenticated` is fine. The problem is that `alter default privileges in schema public revoke execute ... from public` in `20260925000000_lock_down_functions.sql` does nothing, because a per-schema default can't remove Postgres's global grant to PUBLIC. Verified locally: a new function comes out as `{=X/postgres, ...}` and `anon` can execute it. Existing functions are safe because they were revoked by name. Until it's fixed, any migration that adds a function should `revoke execute ... from public, anon` explicitly.
- **`touch_list_entry`** is the one function missing `set search_path` (WAB-28).
- The stickers RLS bug moved into WAB-27 with the rest of stickers.

## Open decisions

- **Rating attribution.** If Eben and Scott both recommended Pulp Fiction to Jake and Jake rates it 5 stars, does each sherpa get credit? `list_entries.rating` is one row per user+media, so crediting everyone is what it supports today. Decide before building Sherpa Score.
- **Media Connection** (in WAB-13). It says users must connect to media libraries before they can recommend. Search runs server-side with our own TMDB and Hardcover keys, so nobody needs to connect anything to search. Ask what it's for: importing history from Letterboxd or Goodreads? As written, it's a wall in front of new users.
- **After removing a nomad** (WAB-30): are the recommendations, reasons and ratings between them hidden, kept for if they reconnect, or deleted?
- **Code names vs glossary names.** The schema says `from_user`/`to_user`. Whether code adopts sherpa/pilgrim is undecided. UI copy uses the glossary.
- **Sherpa Scoring and Media Scoring formulas** are explicitly not decided in WAB-13.

## Design

The mockup at https://claude.ai/artifact/2kVf1bEuKMdUR9h8p14bAA shows the Adventure Page (Lists and History) on a phone, Books tab, Eben's view of Jake. Eben and Jake called it a visually acceptable first pass. Their decisions are sticky notes on the canvas and in WAB-14.

**Direction:** bold, exciting, fun. An adventure between two friends. A muted, earthy first try was rejected.

**Colors will change (WAB-31).** Jake is researching a new palette, and themes are wanted eventually. So:

- **Never hard-code a color in a component.** Every color comes from a named role in one theme file. A palette swap or a new theme is then one file.
- The template's `src/constants/theme.ts` is the natural home. It currently fails typecheck on its `@/global.css` import (see below).

The roles the mockup uses, with current values:

| Role | Value | Used for |
|---|---|---|
| `background` | `#1C1538` | Page, and text on bright fills |
| `surface` | `#2A2150` | Cards, tabs, inputs |
| `surfaceAlt` | `#3A2A5C` | Pass callouts |
| `border` | `#4A3F80` | Outlines, empty slot dots, count badges |
| `text` | `#FFF6E5` | Main text |
| `textSoft` | `#E4DCF7` | Reasons, labels |
| `textMuted` | `#B9AED8` | Secondary text |
| `starEmpty` | `#6E62A0` | Empty stars, drag handles |
| `you` | `#FF6B4A` | The viewer. Their avatar, rank badges, their side's ratings |
| `friend` | `#3DD6F5` | The fellow nomad, the same way |
| `highlight` | `#FFD23F` | Stars, selected tab, "Rate it" |
| `pass` | `#FF9F85` | Pass labels, "spots left" |

Each role is a color picker in the mockup's Tweaks panel, one set per screen, so new colors can be tried live. Mockup fonts: Bricolage Grotesque (headings) and Figtree (body).

## Environment state (Mac, verified 2026-09-27, unchanged since)

Everything below was run and confirmed working.

- Node v22.20.0, npm 10.9.3. `npm install` clean (1118 packages).
- **Deno** installed via Homebrew (was missing).
- **Docker Desktop**, not OrbStack. Daemon must be running before `supabase start`.
- `.env` created, pointing at local Supabase with the local publishable key.
- `supabase/functions/.env` created but **`TMDB_API_TOKEN` and `HARDCOVER_API_TOKEN` are blank** — search can't run until they're filled.
- `npx supabase start` works; all three migrations apply. Studio http://127.0.0.1:54323, Mailpit http://127.0.0.1:54324.
- `npx expo start` boots; web bundle serves 200.

Test suites, all green:

| Command | Result |
|---|---|
| `npm test` | 1 passed (harness only) |
| `npm run test:functions` | 1 passed (harness only) |
| `npm run test:db` | **102 passed**, 4 files |

Two pre-existing failures (WAB-32) that block the "lint and typecheck before done" rule in `AGENTS.md`, both from untouched template files:

- `npx tsc --noEmit` — 2 errors, both CSS imports (`src/components/animated-icon.module.css`, `@/global.css` in `src/constants/theme.ts`). The files exist; the project has no `*.css` module declaration. Deleting the template's `animated-icon.*` removes one; the other needs a `src/types/css.d.ts`.
- `npx expo lint` — 1 error, `setState` inside an effect at `src/hooks/use-color-scheme.web.ts:11`. That hydration guard exists to avoid a server/client render mismatch, which `web.output: "single"` would eliminate — so it may reduce to just `useRNColorScheme()`.

`deno.lock` and `package-lock.json` have small uncommitted changes from the installs. Leave `package-lock.json` out of commits: the change strips `libc` fields from Linux optional dependencies, which is npm-version churn that could break Linux installs.

## What exists in the app

**Essentially nothing.** Every file under `src/` is untouched `create-expo` template except three: `src/lib/supabase.ts`, `src/lib/types.ts`, and a throwaway harness test. No session provider, no `(tabs)`, no sign-in screen, no `Stack` anywhere.

Confirmed against the installed packages rather than from memory:

- `expo-router@57.0.23` **does** export `Stack.Protected`; its props are exactly `{ guard: boolean, children }`.
- Native tabs are at `expo-router/unstable-native-tabs` on SDK 57.
- `app.json` still says `mab-tmp` / `mabtmp`, and `web.output` is `"static"` — which **breaks auth on web**, because static rendering runs in Node where the SQLite-backed `localStorage` used by `src/lib/supabase.ts` doesn't exist. Change to `"single"` before testing sign-in in a browser.
- Sign-up must pass `username` and `display_name` in `options.data`; `handle_new_user` reads them from `raw_user_meta_data` into `profiles`, where `username` is NOT NULL with a `^[a-zA-Z0-9_]{3,24}$` check. Validate client-side or the failure is an opaque database error.
- Keep non-route code out of `src/app/` — every file there is a screen, so a `__tests__` directory would be served as routes. Put testable components in `src/components/` with thin route wrappers.

The edge function `supabase/functions/search-media/index.ts` **has never run**. The Hardcover response shape came from their docs, not a live call. Its three normalizers are anonymous mappers inline inside `fetch` calls — extracting them as pure functions makes them testable against recorded fixtures with no network and no tokens.

## How we work: red → green → refactor (TDD)

**Every change is test-first**:

1. **Red:** write a failing test that describes the behaviour. Run it and watch it fail for the right reason.
2. **Green:** write the least code that makes it pass.
3. **Refactor:** clean up with the tests still green, then repeat.

Nothing is "done" until its tests exist and pass.

| Layer | Tool | What it covers |
|---|---|---|
| App units and components | `jest-expo` + `@testing-library/react-native` | Pure logic (ordering, fractional positions, normalizers), hooks, components |
| Edge functions | `deno test` | Provider normalizers (TMDB, Hardcover, Open Library) against recorded fixtures; dedupe and interleave |
| Database | pgTAP via `npx supabase test db` | Every RPC and every RLS policy, e.g. "Mike cannot read reasons written for Mom", "a declined request looks pending to the requester", "can't recommend to a non-friend" |
| End-to-end (later) | **Playwright** against the Expo web build | Sign up → add friend → recommend with reasons → recipient sees the list |

`supabase/tests/database/00000-test-helpers.sql` provides `tests.create_user`, `tests.authenticate_as`, `tests.authenticate_as_anon`, `tests.clear_authentication`, `tests.user_id`.

Pull pure logic out of components and the edge function into small importable modules so the loop stays fast.

## Still-current platform decisions

| Area | Decision | Why |
|---|---|---|
| App | **Expo (SDK 57) + Expo Router**, one codebase for iOS, Android, web | Fastest route to both web and phones |
| Backend | **Supabase** (Postgres, auth, RLS, Edge Functions) | RLS handles friend-only visibility; edge functions keep API keys server-side |
| Data fetching | **@tanstack/react-query** (installed, not yet wired up) | Caching and invalidation after mutations |
| Movies/series | **TMDB**, not IMDb | IMDb has no public API. TMDB returns IMDb ids if we want links. Requires TMDB attribution in the app |
| Books | **Hardcover** GraphQL, **Open Library** fallback | Goodreads API is closed; Amazon PA-API needs affiliate sales. Hardcover free tier: 5,000 req/day, 60/min, tokens server-side only |
| Friendships | One row per pair, unique on `(least, greatest)` | Single source of truth; stops duplicate and crossed requests |
| Friendship privacy | No direct table access; all through RPCs. Declined looks "pending" to the requester; blocks visible only to the blocker | |
| Stickers | **2.0, not the first release** (WAB-27). Coming out of the schema in WAB-25 | When they return: a curated set describing the media's vibe. Messages and occasions stay reasons |

## Later ideas

- Push notifications for new recommendations (`expo-notifications`).
- More providers: IGDB (games), Podcast Index, MusicBrainz.
- TMDB where-to-watch (JustWatch data) on the media detail screen.

## Setup on a new machine

```sh
git clone https://github.com/wabikemosabi-hub/super-friend.git && cd super-friend
npm install
cp .env.example .env                                           # Supabase URL + publishable key from `npx supabase status`
cp supabase/functions/.env.example supabase/functions/.env     # TMDB / Hardcover tokens
npx supabase start          # needs Docker running
npx expo start
```

Deno is needed for `npm run test:functions` (`brew install deno`).

`AGENTS.md` / `CLAUDE.md` in the repo root say to check the versioned Expo docs (`https://docs.expo.dev/versions/v57.0.0/`) before touching any Expo API, and to use `npx expo install` for packages.
