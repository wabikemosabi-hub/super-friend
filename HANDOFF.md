# Handoff: Media Advisory Board

_Last session: 2026-09-24 (Windows machine). Picking up on the Mac._

## What this is

Friends recommend movies, series, and books to each other. The recommendation itself is the product: each one carries **stickers** (a shared emoji vocabulary for the vibe) and **reasons** (freeform, personal text written for one specific person). The same show can go to Mom with "It will warm the cockles of your heart" and to Mike with something very different.

## Decisions made

| Area | Decision | Why |
|---|---|---|
| App | **Expo (SDK 57) + Expo Router**, one codebase for iOS, Android, and web | Fastest route to both web and phones |
| Backend | **Supabase** (Postgres, auth, RLS, Edge Functions) | RLS handles friend-only visibility; edge functions keep API keys server-side |
| Data fetching | **@tanstack/react-query** (installed, not yet wired up) | Caching and invalidation after mutations |
| Movies/series | **TMDB**, not IMDb | IMDb has no public API (paid AWS licence only). TMDB returns IMDb ids if we want links. Requires TMDB attribution in the app. |
| Books | **Hardcover** GraphQL, **Open Library** fallback | Goodreads API is closed; Amazon PA-API needs affiliate sales. Hardcover free tier: 5,000 req/day, 60/min, and tokens must stay server-side. |
| Friendships | One row per pair (`requester_id`, `addressee_id`, `status`, `blocked_by`), unique on `(least, greatest)` | Single source of truth; stops duplicate and crossed requests |
| Friendship privacy | No direct table access; all through RPCs. Declined looks "pending" to the requester; blocks visible only to the blocker. | |
| Stickers | Curated built-in set (16), optionally user-made. They describe **the media's vibe** only. | Messages ("trust me") and occasions ("date night") are reasons, not stickers. User was explicit about no overlap. |
| Reasons | Written by the sender, scoped to `(author_id, recipient_id)`, unique per lowercase text, reusable | Autocomplete per person; privacy (Mike never sees Mom's reasons); reused reasons become **shelves** for the recipient ("Because Eben says: … (5)") |
| Adding to your own list | A **recommendation to yourself**, auto-accepted | Self-reasons ("because I said so") need no extra tables |
| List entries | One per `(user, media_item)`; many recommendations point at it | "Recommended by Sam, Priya, and Jo" on one card |
| Organizing | User-created **watchlists** with fractional `position` for manual ordering, plus sorting/filtering on My List | User asked for "sort things or create their own watch lists" |

## What exists

- Expo default template, scaffolded and moved to the repo root. **Template screens still in place** (`src/app/index.tsx`, `explore.tsx`) and not yet replaced.
- Installed: `@supabase/supabase-js`, `expo-sqlite` (session storage via `expo-sqlite/localStorage`), `@tanstack/react-query`.
- `supabase/config.toml` from `supabase init`.
- `supabase/migrations/20260924000000_init.sql`: full schema, RLS, RPCs, and sticker seed. RPCs: `my_connections`, `send_friend_request`, `respond_friend_request`, `remove_friend`, `block_user`, `unblock_user`, `upsert_reason`, `send_recommendation`, `accept_recommendation`, `dismiss_recommendation`, `are_friends`.
- `supabase/functions/search-media/index.ts`: searches TMDB and books in parallel, dedupes, upserts into `media_items` with the service role, and returns cached rows interleaved (screen/book).
- `src/lib/supabase.ts`: client, following the Expo Supabase guide.
- `src/lib/types.ts`: hand-written row types.
- `tsconfig.json` excludes `supabase/functions` (Deno code).

## Not verified yet

- **The edge function has never run.** The Hardcover response shape (`data.search.results.hits[].document`) comes from their docs, not from a live call.
- Lint and typecheck have not been run since the changes.

## How we work: red → green → refactor (TDD)

Going forward, **every change is test-first**:

1. **Red:** write a failing test that describes the behaviour. Run it and watch it fail for the right reason.
2. **Green:** write the least code that makes it pass.
3. **Refactor:** clean up with the tests still green, then repeat.

Every feature gets a lot of unit tests. Nothing is "done" until its tests exist and pass. This also applies to the code written so far, which has no tests yet. Planned test layers:

| Layer | Tool | What it covers |
|---|---|---|
| App units and components | `jest-expo` + `@testing-library/react-native` | Pure logic (sorting, grouping into reason shelves, fractional positions, normalizers), hooks, screens |
| Edge functions | `deno test` | Provider normalizers (TMDB, Hardcover, Open Library) against recorded fixtures; dedupe and interleave |
| Database | pgTAP via `npx supabase test db` (`supabase/tests/*.sql`) | Every RPC and every RLS policy, e.g. "Mike cannot read reasons written for Mom", "a declined request looks pending to the requester", "can't recommend to a non-friend" |
| End-to-end (later) | **Playwright** against the Expo web build | Sign up → add friend → recommend with reasons → recipient accepts |

To make the TDD loop easy, pull pure logic out of the React components and the edge function into small, importable modules. For example, split `search-media/index.ts` into `providers/*.ts` with pure `normalize*` functions and a thin handler.

## Next steps, in order

0. **Backfill tests** for the existing code before adding new features. Test tooling is set up (`npm test`, `npm run test:functions`, `npm run test:db`, `npm run test:all`), and the migrations run on the Mac with OrbStack.
   - Done: `supabase/tests/database/friendships.test.sql` covers every friendship RPC. It found two bugs, fixed in `20260925000000_lock_down_functions.sql`: `are_friends` let anyone check any two users' friendship, and `anon` could call every function.
   - `supabase/tests/database/00000-test-helpers.sql` provides `tests.create_user`, `tests.authenticate_as`, `tests.authenticate_as_anon`, `tests.clear_authentication`, and `tests.user_id`.
   - To do: pgTAP for the recommendation RPCs (`upsert_reason`, `send_recommendation`, `accept_recommendation`, `dismiss_recommendation`, including "anon cannot call" checks) and the table RLS policies (profiles, list entries, recommendations, reasons, stickers, watchlists); `deno test` for the edge function's normalizers.
1. **Fix sticker RLS** (write the failing pgTAP test first). The recipient can't currently see a sender's *custom* sticker. The policy `"read built-in and own stickers"` should also allow stickers attached to a recommendation you're part of:
   ```sql
   using (
     created_by is null or created_by = auth.uid()
     or exists (
       select 1 from public.recommendation_stickers rs
       join public.recommendations r on r.id = rs.recommendation_id
       where rs.sticker_id = stickers.id and auth.uid() in (r.from_user, r.to_user)
     )
   )
   ```
2. **Config tidy-up in `app.json`:** name/slug is still `mab-tmp` (rename to `media-advisory-board`, scheme `mab`). Change `web.output` from `"static"` to `"single"`: static rendering runs in Node, where the localStorage-backed session doesn't exist.
3. **Run the backend locally:** `npx supabase start`, `npx supabase db reset`, then `npx supabase functions serve --env-file supabase/functions/.env`. Get a TMDB read-access token from themoviedb.org settings → API.
4. **Session provider** at `src/providers/session-provider.tsx`: context around `supabase.auth.getSession()` and `onAuthStateChange`, exposing `useSession()` and `useUserId()`. (It was drafted and not saved.)
5. **Root layout** `src/app/_layout.tsx`: `QueryClientProvider`, then `SessionProvider`, then `ThemeProvider`, then a `Stack` using `Stack.Protected`:
   - guard `!!session`: `(tabs)`, `media/[id]`, `recommend/[mediaId]` (`presentation: 'modal'`), `watchlist/[id]`
   - guard `!session`: `sign-in`
6. **Tabs** in `src/app/(tabs)/`. Native tabs import from `expo-router/unstable-native-tabs` on SDK 57 (stable path is SDK 58+). Use `sf=`/`md=` icon props. Update `src/components/app-tabs.web.tsx` to match and rebrand from "Expo Starter".
   - `index`, **Inbox**: pending recommendations to me, with sender, stickers, reasons, and note. Accept → `accept_recommendation`; dismiss → `dismiss_recommendation`.
   - `search`: calls `supabase.functions.invoke('search-media', { body: { query, types } })`, with type filter chips.
   - `list`, **My List**: `list_entries` with embedded recommendations. Filters: type and status. Sort: added, title, year, rating. Group by: none, reason (shelves), or recommender. Watchlists row at the top.
   - `friends`: `my_connections()`. Sections: requests, friends, sent. Add by username.
7. **Detail screens:**
   - `media/[id]`: poster, overview, my entry status and rating, who recommended it, and "Add to my list" (a self-recommendation with optional self-reasons) and "Recommend".
   - `recommend/[mediaId]` modal: pick a friend, then toggle stickers, then reason chips with autocomplete from `reasons` where `author_id = me and recipient_id = friend` (ordered by use count via `recommendation_reasons(count)`), plus a note. Calls `send_recommendation`.
   - `watchlist/[id]`: ordered items; reorder by setting `position` to the midpoint of its new neighbours.
8. **Sign-in screen**: email + password, collecting `username` and `display_name` in `options.data` at sign-up. The `handle_new_user` trigger reads these into `profiles`.
9. **Delete template leftovers**: `explore.tsx`, `hint-row`, `web-badge`, `collapsible`, `scripts/reset-project.js`, and the Expo logo splash overlay.
10. Run `npx expo lint`, `npx tsc --noEmit`, and `npx expo-doctor`.

### Useful supabase-js embeds

```ts
// Inbox
supabase.from('recommendations').select(`
  id, note, status, created_at,
  from:profiles!recommendations_from_user_fkey(id, username, display_name, avatar_url),
  media:media_items(*),
  stickers:recommendation_stickers(sticker:stickers(*)),
  reasons:recommendation_reasons(reason:reasons(id, text, author_id))
`).eq('to_user', me).eq('status', 'pending').neq('from_user', me)

// My list
supabase.from('list_entries').select(`
  id, status, rating, added_at, updated_at,
  media:media_items(*),
  recommendations(id, note, created_at,
    from:profiles!recommendations_from_user_fkey(id, username, display_name, avatar_url),
    stickers:recommendation_stickers(sticker:stickers(*)),
    reasons:recommendation_reasons(reason:reasons(id, text, author_id)))
`).eq('user_id', me)
```

## Later ideas

- **Recommender score:** the recipient's `rating` on a list entry feeds back to whoever recommended it. The data is already there, because friends can read each other's `list_entries`.
- Push notifications for new recommendations (`expo-notifications`).
- More providers: IGDB (games), Podcast Index, MusicBrainz.
- TMDB where-to-watch (JustWatch data) on the media detail screen.

## Setup on a new machine

```sh
git clone https://github.com/wabikemosabi-hub/super-friend.git && cd super-friend
npm install
cp .env.example .env                                           # fill in Supabase URL and publishable key
cp supabase/functions/.env.example supabase/functions/.env     # TMDB / Hardcover tokens
npx supabase start          # needs Docker (or OrbStack) running
npx expo start
```

Expo's `AGENTS.md` / `CLAUDE.md` in the repo root say to check the versioned Expo docs (`https://docs.expo.dev/versions/v57.0.0/`) before touching Expo APIs, and to use `npx expo install` for packages.
