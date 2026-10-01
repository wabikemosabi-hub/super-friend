# Handoff: Media Advisory Board

_Last session: 2026-10-01, later (Jake's Mac). **Movie search works end to end locally** (WAB-16): the new `media-search` edge function asks TMDB and caches results in `media_items`; the app has a `useMediaSearch` hook and a `MediaSearch` component, which you can try on the temporary page `/dev/media-search`. **The app now has the ship-computer look** (a gritty cassette-futurism palette, plus Michroma, Space Mono and VT323) from Jake's Basecamp design. Also fixed WAB-35 (database tests broke when real local users existed). Earlier the same day: sign-up works end to end on web (WAB-29, done). Next up: test users for Playwright (WAB-34), then friendships._

## Start here

**Linear is the source of truth, not this document.** The Linear MCP server is authenticated. Read these before touching code:

| Ticket | What it is |
|---|---|
| **WAB-13 Glossary** | The vocabulary. Use these words in UI copy and tickets |
| **WAB-34 Test User Script** | Backlog. **Likely next.** `npm run test-user -- roy-donk` makes local users that can sign in without Google; unblocks Playwright |
| WAB-29 Pick a Username and Avatar | **Done** 2026-10-01. Has a Status section listing what's built and what's left for later |
| WAB-6 Sign In with Google | In progress. Works on web; error states and phones remain |
| WAB-33 Basecamp | In progress. Where you land after sign-in; built from cards. Placeholder for now |
| WAB-16 Media Search | In progress. Movies work through `media-search`; series next. The agreed design is a comment on the ticket |
| WAB-14 Adventure Page | The page between two nomads. Has a "Decisions" section |
| WAB-15 Media Context Page | One piece of media: rate it or pass on it |
| WAB-8 Sherpa Recommendation System | Overview. Sub-tickets WAB-16 to WAB-24 (search, recommend, reasons, ranking, rating, pass, scores, tagging) |
| WAB-9, 10, 11, 30 | Fellow Nomads: add, accept or decline, open an Adventure Page, remove or block. **Need rebuilding** on the new schema |
| WAB-31 Theme Colors | Every color from a named role in one theme file. Updated 2026-10-01 for the ship-computer look (see Design), with every role, its value and use |
| WAB-26 | New database functions are callable by `anon`. Parked, but every new function must revoke it (see Gotchas) |
| WAB-27 Stickers (2.0), WAB-24 Tagging (later) | Backlog |

Closed: WAB-35 (database tests and real local users, done), WAB-29 (sign-up, done), WAB-32 (typecheck and lint), WAB-25 (superseded by the restart), WAB-28 (moot), WAB-12 (duplicate of WAB-14), WAB-7 (archived on purpose), WAB-1 to WAB-4 (Linear samples).

The Adventure Page mockup: https://claude.ai/artifact/2kVf1bEuKMdUR9h8p14bAA (attached to WAB-14).

## Where things stand

Branch `jakelthejakyll/wab-16-media-search` (PR open). Everything below is test-first.

**Database** (five migrations; the old schema is deleted):

- `profiles`: `id` (references `auth.users`, cascades), `username`, `avatar_url` (nullable). Signed-in users read everyone's; you can only create your own and only update `username` / `avatar_url`. **No trigger**: the app creates the profile at sign-up.
- **Usernames use dashes, not underscores** (decided 2026-10-01): 3 to 24 letters or numbers, single dashes between words (`taffy-lee-fubbins`). No dash at the start or end, no double dashes. Unique ignoring case. Migration `usernames_use_dashes`.
- `username_available(name)`: true or false, case-insensitive, signed-in only (`anon` revoked). Migration `username_available`.
- `avatars` storage bucket: public to read, `image/*` only, 5 MB. You can only upload, replace or delete inside `avatars/<your user id>/`.
- `media_items`: the cache of search results that recommendations will point at. One row per `(provider, external_id)`; `external_id` is `movie:<tmdb id>` (TMDB movie and TV ids overlap). Signed-in users read it; only the service role (the edge function) writes; `anon` has no access. Migration `media_items`.
- **Nothing else.** No friendships or recommendations yet.
- Generated types: `src/lib/database.types.ts` (from `npm run db:types`), passed to `createClient<Database>`.

**Edge function `media-search`** (WAB-16; the old `search-media` was never run and is deleted):

- `POST { type, query }`, signed-in callers only (401 otherwise). Only `type: 'movie'` works; `series` and `book` answer 400 "not available yet"; a blank query returns no results without calling TMDB; a TMDB failure is a 502.
- Calls TMDB `/search/movie` (first page, `en-US`, no adult), upserts into `media_items` with the service role, and returns our rows in TMDB's order.
- `metadata` keeps TMDB's `poster_path` and `backdrop_path`, so the app can choose an image size (`tmdbImage(path, 'w185')`).
- Code: `index.ts` (wiring only), `handler.ts` (all logic, dependencies passed in), `providers/tmdb-movies.ts`; shared types in `supabase/functions/_shared/media.ts`. Tests in `supabase/functions/tests/` against recorded TMDB responses in `tests/fixtures/`.
- Run it locally: `npx supabase functions serve --env-file supabase/functions/.env`. Hosted: `npx supabase secrets set TMDB_API_TOKEN=...`.

**Auth:**

- Google OAuth client exists (Google Cloud project made by Eben, testing mode, Eben and Jake as test users). Creating it costs nothing; ignore the "$300 free trial" banner.
- Local Supabase reads the client from the root `.env` (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, gitignored). `supabase/config.toml` has `[auth.external.google]`, `site_url = "http://localhost:8081"`, redirects allowed to `http://localhost:8081/**`. Local email sign-up is also on (no confirmation), which WAB-34 will use.
- Google console redirect URI: `http://127.0.0.1:54321/auth/v1/callback`; JS origin `http://localhost:8081`. A hosted Supabase project will need its own callback URI added there.

**App:**

- `app.json` `web.output` is `"single"` (a single-page app; static rendering broke auth). Plugins include `expo-image-picker` (photo permission message for phones).
- `src/lib/`:
  - `supabase.ts`: the only Supabase client (typed). Reads the sign-in result from the URL on web.
  - `auth.ts`: `signInWithGoogle(returnTo)`, `signOut()`.
  - `username.ts`: `usernameProblem(name)`, the same rule as the database, with the message "Usernames are 3 to 24 letters or numbers, with single dashes between words".
  - `profile.ts`: `createProfile()` (turns `23505` into "That username is taken") and `usernameAvailable()` (calls the database function).
  - `avatar.ts`: `pickAvatar()` (one square image, 0.8 quality, falls back to `image/jpeg`) and `uploadAvatar(userId, avatar)` (to `<id>/avatar.<type>` with `upsert`, returns the public URL).
  - `sign-up.ts`: `finishSignUp(userId, username, avatar)`: upload, then create the profile; returns an error message or `null`.
  - `media-search.ts`: `searchMedia(type, query)` (calls `media-search`; any failure becomes "Search is having trouble. Try again in a moment."), `shouldSearch(query)` (2+ characters), `tmdbImage(path, size)`, `posterPath(item)` (TMDB's poster path from a row's `metadata`).
- `src/hooks/use-media-search.ts`: `useMediaSearch(type, query)` returns `{ results, isSearching, error, noMatches }`. Waits for a 300 ms pause in typing (counted as searching), skips queries under 2 characters, keeps the last results showing while the next load. `noMatches` is true only after a finished search finds nothing.
- `src/components/media-search.tsx`: `MediaSearch` (props `type`, `onPick(item)`), in the ship-computer style. A CRT search field (`media-search-input`), "SCANNING…", "NO SIGNAL. Nothing matches …" and the error message, result rows (`media-search-result-<external_id>`) with a w92 TMDB poster or a tape-label tile, and the TMDB notice. Meant for the Adventure Page's Movies tab (WAB-14). No unit tests on purpose; Playwright will cover it.
- **`src/app/dev/media-search.tsx` is temporary**: a page for trying `MediaSearch`, signed-in nomads with a profile only (listed under the `ready` guard in `_layout.tsx`). Delete the file and its `Stack.Screen` once the Adventure Page uses the component.
- `src/components/tmdb-attribution.tsx`: the notice TMDB requires wherever its data shows. Text only; TMDB also asks for its logo, which needs downloading from TMDB and hasn't been approved yet.
- React Query's `QueryClientProvider` wraps everything in `src/app/_layout.tsx`.
- Fonts: `useAppFonts()` (`src/hooks/use-app-fonts.ts`) loads the four faces in `Typefaces`, and counts as ready even if loading fails, so nobody is stuck on the splash screen. `RootNavigator` waits for both the session and the fonts. `ThemedText` titles and subtitles use Michroma; other text uses Space Mono.
- `src/providers/session-provider.tsx`: `useSession()` returns `{ status, session, profile, refreshProfile }`, status one of `loading`, `signedOut`, `needsProfile`, `ready`.
- `src/app/_layout.tsx`: `SessionProvider` + `Stack.Protected`. Signed out → `sign-in`; no profile → `pick-username`; ready → `index` (Basecamp) and the temporary `dev/media-search`.
- **Pick a username screen** (`PickUsernameScreen`, props `checkUsername`, `onSubmit`, `onSignOut`, `pickAvatar`): spaces and underscores become dashes as you type; half a second after you stop typing a valid name it shows "… is taken" / "… is available" (clears when you type, checks only the name you stop on, ignores stale answers); "Pick an avatar" with a round preview; Continue checks the name rule, then asks for a photo, then sends both. The route (`src/app/pick-username.tsx`) calls `finishSignUp`, then `refreshProfile()`.
- Screens live in `src/components/` as plain components taking props; route files in `src/app/` are thin wrappers. `ActionButton` is the shared button and **requires** a `testID`.
- Basecamp is still a placeholder ("Welcome to Basecamp, <username>" plus sign out).
- Unused Expo template components and images were deleted. Still in place: `src/hooks/use-color-scheme.web.ts` (used, but its hydration guard is pointless now that output is `"single"`).

Eben clicked through on web: Roy-Donk shows taken, a free name shows available, picked a photo, Continue → Basecamp, refresh stays on Basecamp.

**Local data:** a `roy-donk` profile made by a quick SQL insert (`roy@test.local`, no password, can't sign in) and Eben's real `OubliettePadawan`. Replace Roy with the WAB-34 script once it exists. (Jake's Mac: reset on 2026-10-01, so no users; five cached Full Metal Jacket results in `media_items`.)

## Next steps

1. **WAB-34, the test user script**, then **Playwright** end-to-end tests against the web build. Every interactive element has a `testID` (`data-testid` on web). A test image for the file picker goes in `e2e/fixtures/` (not `assets/`, which ships with the app; small; not a real person).
2. **Friendships (WAB-9, 10, 30), then the Fellow Nomads List card on Basecamp (WAB-33).**
3. **Series search (WAB-16):** TMDB `/search/tv`, `external_id` `tv:<id>`, `type: 'series'`, recorded fixtures first. `MediaSearch` already takes a `type`. Then decide on the TMDB logo for `TmdbAttribution`.
4. Sign-in error states and phones (WAB-6): phones need a development build for a stable OAuth redirect. On that build, also check that `uploadAvatar` can read the photo's bytes (`fetch(uri)` works on web).
5. When building "change avatar": add a version to the avatar URL (e.g. `?v=<timestamp>`) so browsers don't keep showing the old picture.
6. Housekeeping: `npx expo install --check` wants patch updates for `expo`, `expo-constants`, `expo-router`, `@expo/ui`. `expo-symbols`, `expo-web-browser` and `expo-image` are no longer used by any code. Do both carefully because of the lockfile gotcha.

## What this is

Friends recommend movies, series and books to each other. Your friends know what you'll actually connect with. The product is the recommendation itself, and eventually knowing *whose* recommendations are reliably right for you. It should feel like an adventure between two friends: a community with zero advertising. Eben wants it **lightweight**: get opinionated later, once we know more.

## Vocabulary (from WAB-13)

| Term | Meaning |
|---|---|
| **Sherpa** | The user giving the recommendation |
| **Pilgrim** | The user receiving it. Every user is both, with different friends |
| **Fellow Nomad** | A friend. Added by username (QR code maybe later) |
| **Basecamp** | Where you land after sign-in. Cards: first the Fellow Nomads List, later "what to watch next" |
| **Adventure Page** | The page between you and one fellow nomad. Only the two of you |
| **Ranking** | The sherpa's order of their list, 1 to 5 |
| **Reasons** | Why the sherpa recommends it. 1 to 3 short ones per pick, private to the pair |
| **Rating** | 1 to 5 stars from the pilgrim once they've finished it |
| **Pass** | "Will not consume". The pilgrim declines, with a reason. Final |
| **History** | Picks the pilgrim rated or passed on |
| **Sherpa Score** | How good a sherpa is for one specific pilgrim. Formula not decided |
| **Media Scoring** | What to consume next, drawn from your best sherpas. Not decided |

## The model (decided 2026-09-28, in the tickets)

- **Sign-up:** Google sign-in, then pick a unique username and an avatar from the camera roll. That's it.
- **The list belongs to the sherpa**: one per sherpa, per pilgrim, per media type ("Eben's movie list for Jake"). Hard cap of **5 active picks**. Sherpa adds, removes, reorders, edits reasons; the pilgrim can't edit it.
- **1 to 3 short reasons per pick**, at least one required, private to the pair.
- **Ratings and passes belong to (pilgrim, media)**, not to one sherpa. Either one takes the pick off *every* sherpa's list (freeing spots) and into History, and **nobody can recommend that media to the pilgrim again**. Ratings can be changed later (rewatch). A pass is final, needs a reason, and every sherpa who had it on their list sees the reason. You can only rate or pass on media recommended to you, and not both.
- **Sherpa's own rating is 2.0.** History shows only the pilgrim's rating or pass for now.
- **No personal list or watchlists.**
- **Stickers are 2.0** (WAB-27).
- Movies ship first, then series.

## Open decisions

- **Rating attribution for Sherpa Score:** if two sherpas recommended the same thing, does the pilgrim's rating credit both? Decide before building Sherpa Score.
- **After removing a nomad** (WAB-30): are their picks and History hidden, kept for if they reconnect, or deleted?
- **Media Connection** (in WAB-13) says users must connect media libraries before recommending. Search uses our own keys, so it's not needed for search. Ask what it's for; as written it's a wall in front of new users.
- **Code names vs glossary names** (`from_user`/`to_user` vs sherpa/pilgrim) for the new tables.
- **Sherpa Scoring and Media Scoring formulas.**

## Conventions (Eben's rules; also in his global CLAUDE.md)

- **Strict red → green → refactor.** Write the test, watch it fail for the right reason, then the least code to pass. pgTAP for every table, policy and function; Jest for app code; `deno test` for edge functions. When a "can't do X" test passes before the code exists, break the code on purpose once to prove the test catches it.
- **Build slowly**, one small piece at a time, run it right away. Eben stops things when they move too fast; check in before big moves (that's how the schema restart happened, and it was the right call).
- **Every interactive element gets a `testID`** (for Playwright later). Use `ActionButton` for buttons.
- **Tests check real values**, not shapes: exact arguments, exact messages, call counts. If a test passes before the code exists, break the code on purpose once to prove the test can fail.
- **Playwright is planned (after WAB-34), and we are prototyping fast** (decided by Jake 2026-10-01). Unit tests that only check how things look or are wired together (which font a text style uses, which colors the theme holds, which screen shows while fonts load) are overkill for now. Keep unit tests for logic, data and security: database rules, edge functions, hooks and `src/lib/`. When a test would really be checking what someone sees on screen, write it as a Playwright test once Playwright is set up, and move existing ones like that over then.
- **Test data uses Taffy Lee Fubbins (`taffy-lee-fubbins`) and Roy Donk (`roy-donk`)**, never real people's names.
- No `any`, enforced by lint (`no-explicit-any` plus the `no-unsafe-*` rules, which catch `any` leaking in from libraries). No comments unless asked. No `console.log`.
- Only `src/lib/supabase.ts` may call `createClient` (lint enforces it).
- **Eben names every commit.** Summarize what's in it and ask for the title. Never mention AI or Claude in commits, PRs or code (attribution is turned off in Eben's Claude settings). Never `git add .`. Run tests before committing.
- **Work in small steps and check in.** Red and green together per test, then stop for Eben to look and name the commit. Show test results in code blocks.
- Never hard-code a color in a component: colors come from the theme (WAB-31).
- `npx expo install` for packages. Check the versioned Expo docs (`https://docs.expo.dev/versions/v57.0.0/`) before using an Expo API.
- **Explain Expo (and Supabase) concepts as we go**; Eben and Jake are learning. Short "Expo note" asides tied to what was just done work well.

## Gotchas learned this session

- **WAB-26:** Postgres gives every new function EXECUTE for PUBLIC, so `anon` can call it. Every migration that adds a function must `revoke execute on function ... from public, anon` and have an "anon cannot call" test.
- **Storage rows can't be deleted with plain SQL** (`storage.protect_delete` trigger). In pgTAP, `select set_config('storage.allow_delete_query', 'true', true);` first, which is what the Storage API does.
- `tests.user_id` reads `auth.users`, so it's `security definer`; otherwise it fails when acting as a signed-in user.
- Jest can't import CSS: `package.json` maps `\.css$` to `jest/style-stub.js` (the template theme imports `global.css`).
- `renderRouter('src/app')`: the path is relative to the project root (it resolves from `process.cwd()`).
- Don't call Supabase from *inside* `onAuthStateChange`; it can deadlock. The provider defers with `setTimeout(..., 0)`.
- RNTL v14: `render`, `renderHook` and `fireEvent` are async; `await` them.
- `package-lock.json`: this machine's npm 10 strips `libc` fields from Linux optional deps (and flips `fsevents` to `dev`). After `npx expo install`, rebuild the lockfile from `HEAD` plus only the new package entries; the `expo-image-picker` commit (`d27942c`) shows the result: 22 lines added, nothing removed.
- **After any migration that changes tables or functions, run `npm run db:types`** and commit `src/lib/database.types.ts` with it.
- Untyped Supabase calls return `any`, which TypeScript happily accepts. That's why the client is typed and lint has the `no-unsafe-*` rules.
- Use `globalThis`, not `global` (no Node types in this project), e.g. `jest.spyOn(globalThis, 'fetch')`.
- `routing.test.tsx` renders real route files. When a route starts importing a `src/lib/` module that touches Supabase or a native module, fake that module there, or Jest crashes on `expo-sqlite`.
- Tests that use `jest.useFakeTimers()` rely on an `afterEach(() => jest.useRealTimers())`, so a failing test can't leak the fake clock.
- Sorting: `order by username` uses `en_US` collation, so `roy-donk` sorts before `Taffy`.
- `git stash@{0}` holds obsolete email/password validation from before the switch to Google. Safe to drop.
- **Database tests must not assume empty tables** (WAB-35). Local databases hold real sign-ups, avatars and cached search results. Scope checks to the test's own users, and when a test inserts a row with a real id (like `movie:600`), delete any existing one first inside the test's transaction; the `rollback` puts it back.
- `supabase.functions.invoke` returns `any`. Assert the response type (`as SearchResponse`); a type annotation alone doesn't satisfy `no-unsafe-assignment`.
- `deno check` on an edge function from the repo root gets confused by the app's `node_modules` (it looks there for `npm:` packages). The real check is `npx supabase functions serve`, which runs Supabase's own runtime. `deno test` is unaffected.
- Edge function tests import JSON fixtures with `import x from './fixtures/x.json' with { type: 'json' };`.

## Design

The mockup (link above) shows the Adventure Page on a phone. Eben and Jake called it a visually acceptable first pass; their notes are in WAB-14.

**Direction:** bold, exciting, fun. A muted, earthy first try was rejected. Letting each nomad pick their own colors is a 2.0 idea.

**The ship-computer look** (chosen by Jake 2026-10-01, merged in PR 8; replaces the first mockup's purple palette and Bricolage/Figtree, and WAB-31 records it): gritty cassette futurism, in the spirit of *2001*, the Nostromo in *Alien*, *Blade Runner*, *Silent Running* and *Outland*. Dark gunmetal panels with rivets and stencilled labels, black CRT screens with green phosphor text, yellow and black hazard stripes, a red status "eye", and one magenta neon glow. Fonts: **Michroma** (headings), **Space Mono** (labels and body), **VT323** (anything on a screen).

- Design canvas (Basecamp for web, phone and empty state, plus the Adventure Page): https://claude.ai/artifact/McuDsyS912uQUoDSAKoW7K. It is private to Jake until he shares it.
- In code: `Colors` and `Typefaces` in `src/constants/theme.ts`. Light and dark mode both use the same palette. Roles: `background`, `backgroundElement` (panel), `backgroundSelected` (raised panel), `edge`, `text`, `textSecondary`, `screen`, `bezel`, `phosphor`, `phosphorDim`, `hazard`, `alert`, `neon`, `you`, `friend`, `onAccent` (dark text on bright fills).
- The canvas's scanlines, glows and hazard stripes use web-only CSS; the app doesn't have them yet.

## Environment (Mac, verified 2026-10-01)

- Node v22.20.0, npm 10.9.3, Deno (Homebrew), Docker Desktop (must be running before `supabase start`), `gh` CLI (installed and logged in 2026-09-28).
- Root `.env`: Supabase URL and publishable key, plus the two Google variables.
- `supabase/functions/.env`: `TMDB_API_TOKEN` must be set for `media-search` (each developer makes their own: themoviedb.org → Settings → API → "API Read Access Token"). `HARDCOVER_API_TOKEN` is unused until book search.
- Jake's Mac (2026-10-01): Node v26 and Deno 2.9 from Homebrew, OrbStack instead of Docker Desktop.
- Studio http://127.0.0.1:54323. Web dev server: `npx expo start --web` on http://localhost:8081.

| Command | Result |
|---|---|
| `npm test` | 96 passed, 16 files |
| `npm run test:functions` | 18 passed, 2 files |
| `npm run test:db` | 40 passed, 5 files |
| `npm run db:types` | regenerates `src/lib/database.types.ts` from local Supabase |
| `npx tsc --noEmit` | passes |
| `npx expo lint` | passes |

## Platform decisions

| Area | Decision | Why |
|---|---|---|
| App | **Expo SDK 57 + Expo Router**, one codebase; **web first** for now | Fastest route to web and phones |
| Backend | **Supabase** (Postgres, auth, storage, RLS, edge functions) | RLS handles who-sees-what; edge functions keep API keys server-side |
| Auth | **Google only**, via Supabase | No passwords to manage; lightweight sign-up |
| Data fetching | **@tanstack/react-query** (wired up in the root layout; first used by `useMediaSearch`) | Caching and invalidation after mutations |
| Movies/series | **TMDB** | IMDb has no public API. Requires TMDB attribution |
| Books | **Hardcover**, **Open Library** fallback | Goodreads API is closed |

## Later ideas

- Push notifications for new recommendations (`expo-notifications`).
- QR codes for adding nomads.
- More providers: IGDB (games), Podcast Index, MusicBrainz.
- TMDB where-to-watch on the media page.

## Setup on a new machine (or for Jake)

```sh
git clone https://github.com/wabikemosabi-hub/super-friend.git && cd super-friend
npm install
cp .env.example .env            # Supabase URL + publishable key (from `npx supabase status`), plus the Google client id and secret
cp supabase/functions/.env.example supabase/functions/.env
npx supabase start              # needs Docker running
npx supabase db reset           # once, if you had the old schema applied
npx expo start --web
```

Get the Google client id and secret from Eben through a password manager, never chat or git. Put your own TMDB read access token in `supabase/functions/.env`. Jake must be a test user on the Google consent screen. Deno is needed for `npm run test:functions` (`brew install deno`).
