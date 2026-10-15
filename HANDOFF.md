# Handoff: Media Advisory Board

_Last sessions: 2026-10-14 and 15 (Eben's Mac). WAB-43 and WAB-44 merged; WAB-53 built 2026-10-15._

- **Built on `ebenbsmith/wab-53-crawler-bridge-look-a-land-based-nostromo`** (2026-10-15, autonomous run): **WAB-53**, the Crawler Bridge look (see Design). Also RATE instead of CURRENT POSITION, lamps plus "1/3" instead of "MAKE THEM COUNT", no "HASN'T REACHED IT YET", and "Navigator:" / "Nomad:" label tapes on the logs. New font package Barlow Condensed; Michroma removed. No database changes.
- **Merged to `main`** (PR #18): **WAB-44**, the Nomad's Log. All 16 encounters, the ad-libbed stories with REDACTED bars, the log and field reports on the Adventure Page, and tapping an entry to flip it to a star card. One new migration (`nomad_log`). See **Ratings and the Nomad's Log** under "Where things stand".
- **Merged to `main`** (PR #17, 2026-10-15): **WAB-43**, reaching a stop. CURRENT POSITION on a road stop → pick stars → a random encounter → 1 to 3 "found" reasons → LOG IT. The stop leaves every route and can't be plotted again. Reroute isn't built (WAB-51).
- **Merged to `main`** (PR #16, 2026-10-10): **WAB-42**, Plot a stop, plus Degauss.
- **Merged to `main`** (PR #15, 2026-10-08): **WAB-41**, the Adventure Page as a road map. Your road (the stops your navigator plotted for you) plus the Nav Console (your route for them).
- **Merged to `main`** (PR #13 and #14): the Adventure Page (WAB-11, WAB-14), sign out from your avatar (WAB-38), and the `recommendations` table capped at **3 stops** per route (WAB-40).
- **The wasteland world** (WAB-39): **navigators** plot **routes** of **3 stops** for fellow **nomads**. Ratings show as **encounters**, passing is a **reroute**, and history is the **Nomad's Log**. Everything is on the [Wasteland Adventure Map canvas](https://claude.ai/artifact/VXnLDmWxEd7C8DUYtg14Mx) and in WAB-39's sub-tickets.
- **Way of working that went well:** one small step at a time on the feature's own branch, strictly test-first, with a check-in and a commit Eben names after each step. When Eben opts in, Claude can run a whole agreed plan on its branch instead, still test-first. Check in when a product rule isn't in the tickets.

## Next session: start here

1. Eben looks over WAB-53 on web and a phone (manual test plan section 13), then the PR for Jake. After pulling it: `npm install` (new font package).
2. Pick the next thing with Eben. Ready to build: **WAB-49** share a log entry as styled text (designed; the sign-off line is the only open question), **WAB-51** reroute, **WAB-52** OVERALL JOURNEY. Parked: **WAB-50** rewatch (the database already supports it).
3. **WAB-46 Unanswered questions** is where open product questions go for Eben and Jake to settle together. Add new ones there rather than making a ticket each.
4. **WAB-45, deploy for friends** on a subdomain of Eben's onlyfins.wtf: hosted Supabase, Google sign-in settings, `npx expo export -p web`, then DNS. Agree with Jake first. The App Store age rating will need to know about the 5★ stories' sexual and drug jokes, whenever phones ship.
5. Small known defect: at phone width, the road panel's header badge is cut off ("3 STOPS · JUST STARTI…").
6. The old `ebenbsmith/wab-39-wasteland-road-map` branch is empty (just PR #13's commits) and can be deleted, once Eben says so.
7. The app rename (Media Wasteland Nomads) waits on Eben and Jake.

## Start here

**Linear is the source of truth, not this document.** The Linear MCP server is authenticated. Read these before touching code:

| Ticket | What it is |
|---|---|
| **WAB-13 Glossary** | The vocabulary. Use these words in UI copy and tickets |
| **WAB-9 Add a Nomad** | In progress, built. **Read its "Requests and declines" section** (decided by Eben 2026-10-07) before touching connections |
| **WAB-10 Accept or Decline** | In progress, built. The ticket says the asker "is informed" on accept; today they just see the new nomad in their list (no badge or notice yet) |
| WAB-34 Test User Script | In progress in Linear, but the seed users plus the dev email sign-in cover it (see Auth). Decide whether to close it or keep a script for making more users |
| WAB-29 Pick a Username and Avatar | **Done** 2026-10-01. Has a Status section listing what's built and what's left for later |
| WAB-6 Sign In with Google | In progress. Works on web; error states and phones remain |
| WAB-33 Basecamp | In progress. Header, CH-01 Fellow Nomads and CH-02 Nomad requests are built; CH-03 "Probably watch next" waits for recommendations |
| WAB-16 Media Search | In progress. Movies work through `media-search`; series next. The agreed design is a comment on the ticket |
| WAB-14 Adventure Page | The page between two nomads. Has a "Decisions" section |
| WAB-15 Media Context Page | One piece of media: rate it or pass on it |
| WAB-8 Sherpa Recommendation System | Overview. Sub-tickets WAB-16 to WAB-24 (search, recommend, reasons, ranking, rating, pass, scores, tagging) |
| WAB-11 | In progress, built: tapping a Fellow Nomads row opens the Adventure Page |
| WAB-30 | Remove or block a nomad. Not started. Block is "never" where a decline is "not now" |
| **WAB-39 Wasteland world** | **Read this before touching the Adventure Page.** New names, encounters, the Nomad's Log, the road map, plotting a stop. Its sub-tickets are the build order |
| WAB-40 | A route holds 3 stops, not 5. **Done** in PR #13 (migration `routes_hold_three_stops`) |
| WAB-41 | The Adventure Page as a road map with today's data (no database changes). **Merged** in PR #15 |
| WAB-42 | Plot a stop: search, reasons, replace when full, dimmed results. **Merged** in PR #16 (the live preview was cut, see Plot a stop) |
| WAB-43 | Reaching a stop: stars + reasons → encounter. **Merged** in PR #17. Has a Status section; reroute moved to WAB-51 |
| WAB-44 | Nomad's Log with ad-libbed stories, field reports and the flip. **Built** 2026-10-15. Has a Status section |
| WAB-47, 48, 49 | Sharing a log entry: a link that unfolds into a preview card, a picture, and styled text (49 comes first) |
| WAB-50 | Rewatch: log a stop again. Parked; the database already supports it |
| WAB-51 | Reroute: skip a stop with a reason (the other half of WAB-43) |
| WAB-53 | The Crawler Bridge look (PR #19) |
| WAB-54 | Name your land crawler at sign-up; Basecamp's header shows it (Eben's idea) |
| WAB-52 | OVERALL JOURNEY: every log entry in one place (Eben's idea, after WAB-44) |
| WAB-45 | Deploy the web build for friends on a subdomain of onlyfins.wtf |
| **WAB-46 Unanswered questions** | A running list of open product questions for Eben and Jake to settle together. Add new ones under "Open" instead of making a ticket each. First one: should the map's "ROUTE 1" tags say "STOP 1"? |
| WAB-36, 37 | Small defects: request avatars, search placeholder |
| WAB-31 Theme Colors | Every color from a named role in one theme file. Updated 2026-10-01 for the ship-computer look (see Design), with every role, its value and use |
| WAB-26 | New database functions are callable by `anon`. Parked, but every new function must revoke it (see Gotchas) |
| WAB-27 Stickers (2.0), WAB-24 Tagging (later) | Backlog |

Closed: WAB-31 (theme colors, done; records the ship-computer look), WAB-35 (database tests and real local users, done), WAB-29 (sign-up, done), WAB-32 (typecheck and lint), WAB-25 (superseded by the restart), WAB-28 (moot), WAB-12 (duplicate of WAB-14), WAB-7 (archived on purpose), WAB-1 to WAB-4 (Linear samples).

Mockups are Claude Design canvases on claude.ai, not files in the repo. The list is under **Design → Mockups** below.

## After you pull

Someone else's merged work can need a few local steps. Run these after every `git pull` on `main`:

```sh
npm install                          # new packages, if any
git restore package-lock.json        # this Mac's npm rewrites it (strips libc lines); main's copy is correct
npx supabase migration list --local  # anything with an empty "remote" hasn't been applied yet
npx supabase migration up            # applies new migrations and keeps your data
npm run test:all                     # Jest, functions, database
```

**Search needs the edge functions running.** `npx supabase start` doesn't start them; run `npx supabase functions serve --env-file supabase/functions/.env` in its own terminal and leave it open. Without it, search answers 503 and the app says "Search is having trouble".

Then restart `npx expo start --web` if packages changed, and restart `npx supabase functions serve --env-file supabase/functions/.env` if functions changed. If a pull **rewrote or deleted old migrations** (like the 2026-09-28 restart), `migration up` isn't enough: run `npx supabase db reset`, which wipes local data and rebuilds from the migrations.

**If a pull changed `supabase/seed.sql`, `supabase/seed/` or the buckets in `config.toml`, run `npx supabase db reset` too.** `migration up` never seeds. A reset runs the migrations, then `seed.sql`, then uploads the seed files to storage. The 2026-10-07 work needs one reset to create the seed users and their avatars.

## Where things stand

Everything below was built test-first. Everything through WAB-43 is merged (PR 12 to 17). WAB-44 is on `ebenbsmith/wab-44-nomads-log-with-ad-libbed-stories` until its PR merges.

**Database** (sixteen migrations; the old schema is deleted):

- `profiles`: `id` (references `auth.users`, cascades), `username`, `avatar_url` (nullable). Signed-in users read everyone's; you can only create your own and only update `username` / `avatar_url`. **No trigger**: the app creates the profile at sign-up.
- **Usernames use dashes, not underscores** (decided 2026-10-01): 3 to 24 letters or numbers, single dashes between words (`taffy-lee-fubbins`). No dash at the start or end, no double dashes. Unique ignoring case. Migration `usernames_use_dashes`.
- `username_available(name)`: true or false, case-insensitive, signed-in only (`anon` revoked). Migration `username_available`.
- `avatars` storage bucket: public to read, `image/*` only, 5 MB. You can only upload, replace or delete inside `avatars/<your user id>/`.
- `media_items`: the cache of search results that recommendations will point at. One row per `(provider, external_id)`; `external_id` is `movie:<tmdb id>` (TMDB movie and TV ids overlap). Signed-in users read it; only the service role (the edge function) writes; `anon` has no access. Migration `media_items`.
- `nomad_connections` (WAB-9, 10): one row per pair (`requester_id`, `addressee_id`, `status` = `pending` | `accepted` | `declined`, `created_at`, `responded_at`, `last_asked_at`). A unique index on the pair (in either order) stops duplicates. RLS is on with **no policies**: nobody reads or writes the table directly, only through three `security definer` functions, all with `anon` revoked:
  - `send_connection_request(username)`: case-insensitive lookup. Raises "No nomad named …" or "You can't connect with yourself". If they already asked you (pending **or** declined), you're connected on the spot. If you already asked them, only `last_asked_at` resets. Otherwise inserts a pending row.
  - `respond_to_connection_request(connection_id, accept)`: only the addressee, only while pending; does nothing otherwise.
  - `my_connections()`: `connection_id`, `nomad_id`, `username`, `avatar_url`, `status`, `outgoing`. A declined request shows as `pending` to the asker and disappears for the decliner. Outgoing requests that aren't accepted drop out after 30 days since `last_asked_at`; incoming ones stay until answered.
  - Migrations `nomad_connections`, `declined_nomads_can_change_their_mind`, `outgoing_requests_fade`, `asking_again_restarts_the_fade`. 
- `recommendations` (WAB-14): one row per pick (`recommender_id`, `recipient_id`, `media_item_id`, `rank` 1 to 3, `reasons text[]` 1 to 3, `created_at`), unique per (recommender, recipient, media item). The column is `rank`, not `position` (`position` is a reserved word Postgres refuses as an output column, and "Ranking" is the glossary word). RLS on, **no policies, and every privilege revoked**: only two `security definer` functions, `anon` revoked:
  - `add_recommendation(nomad_id, media_item_id, reasons) returns uuid`: trims reasons and drops blanks, then raises (in order) "You can only recommend to fellow nomads" (pending, declined, yourself, strangers), "No media item with that id", "Give 1 to 3 reasons", "Keep each reason under 140 characters", "That's already on your list", "Your movie route for <username> is full" (**3 per media type per pair**, decided 2026-10-08; migration `routes_hold_three_stops`). New picks get the next rank.
  - `adventure_recommendations(nomad_id)`: `id`, `outgoing`, `rank`, `reasons`, `media_item_id`, `type`, `external_id`, `title`, `year`, `metadata`, both directions between you and that nomad only, and nothing at all unless you're accepted fellow nomads (so picks hide if a connection ever ends).
  - `replace_recommendation(recommendation_id, media_item_id, reasons) returns uuid` (WAB-42, migration `replace_a_stop`): swaps one of your stops for another movie. It raises, in order, "No stop like that on your route" (someone else's stop, or no such id), "You can only recommend to fellow nomads", "No media item with that id", "Replace a movie stop with another movie" (same media type only), the two reasons messages, then "That's already on your list". The old row is deleted and the new one takes its rank. The nomad isn't told it was swapped. `anon` revoked.
  - Migration `recommendations`. No remove, reorder or edit yet.
  - Since WAB-43, `add_recommendation` and `replace_recommendation` also refuse media the nomad already reached: "<username> already reached that stop" (migration `reached_stops_stay_off_routes`).
- `stop_ratings` (WAB-43): one row per rating (`nomad_id`, `media_item_id`, `navigator_id` (set null if they delete their account), `promised_reasons text[]`, `stars` 1 to 5, `encounter` (a position in that star level's list), `reasons text[]` 1 to 3, `created_at`). **No unique on (nomad, media)**: the log only adds, and the newest row is the current rating. RLS on, every privilege revoked. Three `security definer` functions, `anon` revoked:
  - `rate_stop(media_item_id, stars, encounter, reasons) returns uuid`: the **app** picks the random encounter (it already showed it to you). Raises, in order, "Pick 1 to 5 stars", "No encounter like that", "Give 1 to 3 reasons", "Keep each reason under 140 characters", "You can only rate stops plotted for you". It copies the **first** navigator who plotted it (by `created_at`) and their reasons onto the rating, reuses the last encounter if you rate again with the same stars, deletes the media from **every** route for you, and closes up the ranks left behind. Migration `reaching_a_stop`. (A `watched_on` date was built and then dropped on 2026-10-15: the date is the day you log it.)
  - `reached_stops(nomad_id)`: `media_item_id`, `external_id`, `stars`, `encounter` for each media that fellow nomad reached (latest rating). Powers the dimmed "ALREADY REACHED THIS" search results. Not for yourself. Migration `reached_stops`.
  - `nomad_log(nomad_id)` (WAB-44): every rating between you and one fellow nomad, both directions, newest first, rewatches included: `id`, `mine` (you wrote it), `navigator` (username, `null` if gone), `media_item_id`, `title`, `year`, `stars`, `encounter`, `reasons`, `promised_reasons`, `created_at`. A rating for a stop someone else plotted stays out. Accepted fellow nomads only, never yourself. Migration `nomad_log`.
- Generated types: `src/lib/database.types.ts` (from `npm run db:types`), passed to `createClient<Database>`.

**Edge function `media-search`** (WAB-16; the old `search-media` was never run and is deleted):

- `POST { type, query }`, signed-in callers only (401 otherwise). Only `type: 'movie'` works; `series` and `book` answer 400 "not available yet"; a blank query returns no results without calling TMDB; a TMDB failure is a 502.
- Calls TMDB `/search/movie` (first page, `en-US`, no adult), upserts into `media_items` with the service role, and returns our rows in TMDB's order.
- `metadata` keeps TMDB's `poster_path` and `backdrop_path`, so the app can choose an image size (`tmdbImage(path, 'w185')`).
- Code: `index.ts` (wiring only), `handler.ts` (all logic, dependencies passed in), `providers/tmdb-movies.ts`; shared types in `supabase/functions/_shared/media.ts`. Tests in `supabase/functions/tests/` against recorded TMDB responses in `tests/fixtures/`.
- Run it locally: `npx supabase functions serve --env-file supabase/functions/.env`. Hosted: `npx supabase secrets set TMDB_API_TOKEN=...`.

**Auth:**

- Google OAuth client exists (Google Cloud project made by Eben, testing mode, Eben and Jake as test users). Creating it costs nothing; ignore the "$300 free trial" banner.
- Local Supabase reads the client from the root `.env` (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, gitignored). `supabase/config.toml` has `[auth.external.google]`, `site_url = "http://localhost:8081"`, redirects allowed to `http://localhost:8081/**`. Local email sign-up is also on (no confirmation).
- **Seed users and dev sign-in** (2026-10-01, avatars 2026-10-07): `supabase/seed.sql` makes `bart-harley-jarvis@dev.local` and `paul-bufano@dev.local` (the password is in that file) with profiles and avatars. Their pictures live in `supabase/seed/avatars/<user id>/avatar.png`, and `config.toml`'s `[storage.buckets.avatars]` (`objects_path = "./seed/avatars"`, same rules as the migration) uploads them on every `db reset`. They aren't connected to each other, so you can try a request. In development builds only (`__DEV__`), the sign-in screen shows a "DEV ONLY: test nomads" email form (`signInWithPassword` in `src/lib/auth.ts`; testIDs `email-sign-in-email`, `-password`, `-submit`, `-error`). Playwright can sign in through it. Seed emails end in `@dev.local` on purpose (see Gotchas).
- Google console redirect URI: `http://127.0.0.1:54321/auth/v1/callback`; JS origin `http://localhost:8081`. A hosted Supabase project will need its own callback URI added there.

**App:**

- `app.json` `web.output` is `"single"` (a single-page app; static rendering broke auth). Plugins include `expo-image-picker` (photo permission message for phones).
- `src/lib/`:
  - `supabase.ts`: the only Supabase client (typed). Reads the sign-in result from the URL on web.
  - `auth.ts`: `signInWithGoogle(returnTo)`, `signInWithPassword(email, password)` (dev form only), `signOut()`.
  - `connections.ts`: `sendConnectionRequest(username)`, `myConnections()`, `respondToConnectionRequest(id, accept)` (database errors pass through as-is; their messages are already friendly), `groupConnections(rows)` → `{ nomads, incoming, outgoing }`, each sorted by username ignoring case. `Connection` is the generated `my_connections` row type.
  - `username.ts`: `usernameProblem(name)`, the same rule as the database, with the message "Usernames are 3 to 24 letters or numbers, with single dashes between words".
  - `profile.ts`: `createProfile()` (turns `23505` into "That username is taken") and `usernameAvailable()` (calls the database function).
  - `avatar.ts`: `pickAvatar()` (one square image, 0.8 quality, falls back to `image/jpeg`) and `uploadAvatar(userId, avatar)` (to `<id>/avatar.<type>` with `upsert`, returns the public URL).
  - `sign-up.ts`: `finishSignUp(userId, username, avatar)`: upload, then create the profile; returns an error message or `null`.
  - `media-search.ts`: `searchMedia(type, query)` (calls `media-search`; any failure becomes "Search is having trouble. Try again in a moment."), `shouldSearch(query)` (2+ characters), `tmdbImage(path, size)`, `posterPath(item)` (TMDB's poster path from a row's `metadata`), `overviewLine(item)` (TMDB's first sentence; over 120 characters it's cut at a word with "…"; `null` when there's no overview).
- `src/lib/connections.ts` also has `findNomad(nomads, username)` (ignores case, `null` when not a fellow nomad).
- `src/lib/recommendations.ts`: `addRecommendation`, `replaceRecommendation`, `adventureRecommendations` (database errors pass through), `cleanReasons`, `reasonsProblem` (the database's rule, same messages), `splitRecommendations(rows, type)` → `{ fromThem, toThem }` by rank, `openSlots`, `onRoute(route, externalId)`, `MAX_PICKS = 3`.
- `src/hooks/use-adventure.ts`: `useAdventure(nomadId | null, type)` returns `{ fromThem, toThem, reached, log, reports, isLoading, error, add(mediaItemId, reasons), replace(recommendationId, mediaItemId, reasons), rate(mediaItemId, stars, encounter, reasons) }`. Keys `['adventure', nomadId]`, `['reached', nomadId]` and `['log', nomadId]`, all off until the nomad is known. `add`, `replace` and `rate` clean the reasons, then refresh (`rate` refreshes the log too); a refusal comes back as an error and nothing refreshes. If `reached` or the log fail to load, they're just empty and the page still works.
- `src/lib/scan-line.ts` and `src/hooks/use-degauss.ts` (Degauss): `useDegauss()` returns `{ scanning, degauss() }`. The choice is kept in `localStorage` under `scan-line` (`'on'` / `'off'`). On phones that `localStorage` comes from `expo-sqlite/localStorage/install`, the same thing Supabase uses. If storage is blocked, the line runs and the switch still works for that visit.
- `src/hooks/use-connections.ts`: `useConnections()` returns `{ nomads, incoming, outgoing, isLoading, error, send(username), respond(id, accept) }`. React Query key `['connections']`; `send` and `respond` refresh the list afterwards; `send` rejects with the database's message so the screen can show it.
- `src/hooks/use-media-search.ts`: `useMediaSearch(type, query)` returns `{ results, isSearching, error, noMatches }`. Waits for a 300 ms pause in typing (counted as searching), skips queries under 2 characters, keeps the last results showing while the next load. `noMatches` is true only after a finished search finds nothing.
- `src/components/media-search.tsx`: `MediaSearch` (props `type`, `onPick(item)`), in the ship-computer style. A CRT search field (`media-search-input`), "SCANNING…", "NO SIGNAL. Nothing matches …" and the error message, result rows (`media-search-result-<external_id>`) with a w92 TMDB poster or a tape-label tile, and the TMDB notice. Optional `unavailable(item)` returns `{ note, testID }` or `null`: a row with a note is dimmed, shows the note, and can't be picked. Search itself knows nothing about routes. While the field has focus its border lights up `phosphorDim` (instead of the browser's blue focus ring). No unit tests on purpose; Playwright will cover it.
- `src/components/ship-modal.tsx`: `ShipModal` (props `visible`, `channel`, `heading`, `onClose`, `closeLabel`, `testID`, `children`; it was `MediaSearchModal` until WAB-42) puts anything in React Native's `Modal`: a header with a channel plate, the heading and a close button (`<testID>-close`). On web it's a centered panel (up to 640 px) over a `scrim` backdrop that closes it when clicked (`<testID>-backdrop`); on phones it slides up full screen. A `Modal` rather than a modal route because it's a self-contained task that hands a value back (Expo's docs recommend `Modal` for that). Closing unmounts what's inside, so the next open starts fresh.
- `src/components/account-button.tsx`: `AccountButton` (WAB-38), your avatar plus `OPERATOR: <USERNAME>` as one button (`account-button`, plate text `account-operator`) that opens Sign out (`account-sign-out`). On Basecamp and the Adventure Page; every new screen's header should use it.
- `src/components/media-poster.tsx`: `MediaPoster` (w92 TMDB poster or the tape-label tile), shared by search results and the Adventure Page. `posterPath` takes anything with `metadata`.
- The temporary `dev/media-search` page is gone; the Adventure Page uses the modal now.
- `src/components/tmdb-attribution.tsx`: the notice TMDB requires wherever its data shows. Text only; TMDB also asks for its logo, which needs downloading from TMDB and hasn't been approved yet.
- React Query's `QueryClientProvider` wraps everything in `src/app/_layout.tsx`.
- Fonts: `useAppFonts()` (`src/hooks/use-app-fonts.ts`) loads the five faces in `Typefaces` (Barlow Condensed 800 and 700, Space Mono 400 and 700, VT323), and counts as ready even if loading fails, so nobody is stuck on the splash screen. `RootNavigator` waits for both the session and the fonts. `ThemedText` titles and subtitles use Michroma; other text uses Space Mono.
- `src/providers/session-provider.tsx`: `useSession()` returns `{ status, session, profile, refreshProfile }`, status one of `loading`, `signedOut`, `needsProfile`, `ready`.
- `src/app/_layout.tsx`: `SessionProvider` + `Stack.Protected`. Signed out → `sign-in`; no profile → `pick-username`; ready → `index` (Basecamp) and `adventure/[username]`.
- **Pick a username screen** (`PickUsernameScreen`, props `checkUsername`, `onSubmit`, `onSignOut`, `pickAvatar`): spaces and underscores become dashes as you type; half a second after you stop typing a valid name it shows "… is taken" / "… is available" (clears when you type, checks only the name you stop on, ignores stale answers); "Pick an avatar" with a round preview; Continue checks the name rule, then asks for a photo, then sends both. The route (`src/app/pick-username.tsx`) calls `finishSignUp`, then `refreshProfile()`.
- Screens live in `src/components/` as plain components taking props; route files in `src/app/` are thin wrappers. Both button components **require** a `testID`: `ActionButton` (the older rounded one, still on sign-in and pick-username) and `ShipButton` (ship-computer style, `hazard` | `phosphor` | `panel` | `alert`, used on Basecamp and the Adventure Page).
- **Basecamp** (`BasecampScreen`, built from Jake's canvas; the route `src/app/index.tsx` passes in `useConnections()` and the profile). No unit tests on purpose; Playwright will cover it:
  - **Header:** "MAB-1 · LAND CRAWLER · DEEP FIELD UNIT", the red status eye beside a stencil BASECAMP title, on a cream console. Your avatar and `OPERATOR: <USERNAME>` plate are the shared `AccountButton` (see below). A red line and a hazard stripe run underneath.
  - **CH-01 Fellow Nomads** (`fellow-nomads-card.tsx`): a two-digit count (`fellow-nomads-count`), rows `fellow-nomad-<username>` with an avatar, the "NO SIGNAL" empty state (`fellow-nomads-empty`), then "ADD A NOMAD BY USERNAME" (`add-nomad-input`, placeholder `#username` that hides on focus; `add-nomad-send`, disabled while empty). Shows `REQUEST SENT TO …` (`add-nomad-sent`) or the error in `alert` red (`add-nomad-error`).
  - **CH-02 Nomad requests** (`nomad-requests-card.tsx`): incoming as "INCOMING TRANSMISSION" with Accept / Decline (`incoming-<username>-accept`, `-decline`); outgoing as dim "OUTGOING TRANSMISSION · waiting for a yes" (`outgoing-<username>`); "NO TRANSMISSIONS" when empty.
  - Shared pieces in `ship-panel.tsx`: `ShipPanel` (riveted card with a `CH-xx` plate), `Plate`, `CrtScreen`, `ShipButton`, `HazardStripe`. `nomad-avatar.tsx`: `NomadAvatar` shows the picture, or the initial when there's no `avatar_url`.
- **Adventure Page** (`AdventureScreen`, route `src/app/adventure/[username].tsx`, under the `ready` guard; WAB-11, WAB-14, rebuilt as a road map in WAB-41). Routing tests cover reaching it and seeing a stop on each side; Playwright will cover the look:
  - Basecamp rows (`fellow-nomad-<username>`) are buttons that `router.push('/adventure/<username>')`. The page finds the nomad in `my_connections()` with `findNomad`; anyone else gets "NO SIGNAL" (`adventure-not-found`).
  - Header (unchanged): back (`adventure-back`), ADVENTURE plate, both avatars, "You & <username>" (`adventure-title`), `@username · Fellow Nomad` (`adventure-nomad`), and your `AccountButton`.
  - Tabs: Movies works; Series and Books are disabled with "SOON" (`adventure-tab-movies` and so on).
  - **900 px and wider:** the road (2/3) and the Nav Console (1/3) side by side. **Narrower:** a switch between "MY ROAD" and "PLOT <NAME>'S ROUTE" (`adventure-view-road`, `adventure-view-console`).
  - **Your road** (`road-map.tsx`, NAV-01, `road-map`): the canvas's "Just Starting Out" view. A logged stop just leaves the road; "stops behind you" isn't built. Wide: a CRT map with a wireframe terrain (a ridge line plus a floor grid tilted back with `perspective` and `rotateX`; theme role `grid`), a blinking YOU ARE HERE (`road-here`), and the stops spread out (`road-stop-<external_id>`), each with its own dotted line from YOU ARE HERE (line 1 boldest). A faint green CRT scan bar sweeps down the map every 4 seconds (Eben tried the canvas's jiggle and it felt like the map was breathing). Stop 2 sits at 70% down the map (was 82%, which cut off its label): a stop's center has to stay above about 75%, because its box, two-line title and tag hang about 94 px below it on a 380 px map. Tapping a stop shows it in the detail screen below (`road-detail`, stop 1 at first). Narrow: a strip map running top to bottom, each stop a `MediaRow` that opens to its reasons. `road-empty`, `road-loading`. Lines are rows of small `View`s (no `react-native-svg`), and the animations use React Native's own `Animated`.
  - **Degauss** (Eben, 2026-10-10; two people didn't like the scan line and Eben loves it): on the wide map only, the road map's header has a small monitor-style key (`road-degauss`, a `switch` for screen readers) with an LED beside it (`road-degauss-light`, glowing `phosphor` while the line runs). Pressing it makes the map screen (`road-screen`) wobble for about half a second, then switches the line, and the choice is remembered (`useDegauss`). The wobble is three lists at the top of `road-map.tsx`: `jolt` (px sideways), `tilt` (`skewX`) and `flicker` (opacity), over `duration: 520`. With "reduce motion" on (`AccessibilityInfo`), it skips the wobble and just switches. Mashing it restarts the wobble, and only the last press switches.
  - **Nav Console** (`nav-console.tsx`, NAV-02, `nav-console`): 3 lamps and `console-slots` (`routeCount`: "1/3"), then your stops (`console-stop-<external_id>`), folded shut until tapped, that open to the reasons. The button (`plot-stop-open`) reads "Plot a stop for <name>", or "Replace a stop on <name>'s route" in `alert` red when the route is full. It opens the Plot a stop panel. There's no edit, remove or reorder yet (Eben, 2026-10-08: they wait for the database functions). Field reports sit in their own panel under the console (see Ratings and the Nomad's Log).
  - **Plot a stop** (`plot-stop-panel.tsx`, WAB-42, built to the canvas's `PlotPanel` board): one `ShipModal` (`plot-stop`, NAV-02 plate). Step chips (`plot-stop-step-<step>`) are 1 · SEARCH and 2 · REASONS, or 1 · STOP TO REPLACE first when the route is full.
    - **Stop to replace** (full route only): "<NAME>'S ROUTE IS FULL. WHICH STOP ARE YOU REPLACING?", your stops as radio rows (`plot-stop-replace-<rank>`, the chosen one outlined in `alert` with REPLACING), the footnote about the swap, and "Find its replacement" (`plot-stop-replace-next`). **Nothing is chosen at first** and the button is disabled until you choose (the canvas pre-chose stop 2; changed on purpose so nobody replaces by accident).
    - **Search:** `MediaSearch` with `unavailable`. Anything already on your route (including the stop being replaced) shows "ALREADY ON YOUR ROUTE" (`plot-stop-unavailable-<external_id>`). Search stays mounted (just hidden) while you're on reasons, so Back to search keeps the query and results.
    - **Reasons** (`reasons-form.tsx`, `plot-stop-reasons`): the cover, title (`plot-stop-title`), year and `overviewLine` (`plot-stop-overview`), then "GREAT STOP BECAUSE:" with REASON 1 · REQUIRED and 2, 3 · OPTIONAL (`plot-stop-reason-1..3`). Reason 1's placeholder hides on focus and the focused field's border lights up `phosphorDim`. When replacing, a red dashed swap card (`plot-stop-swap`) shows STOP N · THE SWAP with OUT (the old stop, `plot-stop-swap-out`) and IN (the new one, `plot-stop-swap-in`). Then `plot-stop-error`, Back to search (`plot-stop-back`), and Plot it or Replace (`plot-stop-submit`).
    - **Done:** "STOP N PLOTTED" / "STOP N REPLACED" (`plot-stop-done-line`) and Back to the console (`plot-stop-done`). It keeps the mode and number from when you saved, so plotting the 3rd stop doesn't flip the header to "Replace…" underneath. The canvas's "drag it in the console to change its rank" is left out until reorder exists.
    - **Cut:** the canvas's live "PREVIEW · HOW IT SHOWS UP ON <NAME>'S MAP" box. Eben tried it and cut it (2026-10-10): it only repeated what's already on screen.
    - Search also dims media the nomad already reached: "<NAME> ALREADY REACHED THIS: <ENCOUNTER>" (`plot-stop-reached-<external_id>`), from `blockedStop` in `src/lib/ratings.ts` through the panel's `unavailable`.
  - Shared pieces: `MediaRow` and `StopReasons` (`media-row.tsx`: cover, title, ▸/▾, opens in place) and `ScreenLine` (now in `ship-panel.tsx`).
  - Logic in `src/lib/road-map.ts` (unit tested): `roadStops`, `youAreHere`, `dottedLine`, `lineWeight`, `slotsLine`, `toggleOpen`.
- **Ratings and the Nomad's Log** (WAB-43, WAB-44):
  - **Encounters** live in `src/constants/encounters.ts`: `encounters: Record<Stars, Encounter[]>`, each `{ title, story }`, all written by Eben and Jake (16: 3 per star level, 4 for 3 stars; never generated). **A rating stores its encounter's position**, so add new ones at the end of a level and never reorder or delete; rewording is fine. A test fails if a level has fewer than 3 or a placeholder, and another fails if any story has a slot `fillTemplate` can't fill (like a typo `{promsied2}`).
  - Story slots: `{date}`, `{navigator}`, `{title}`, `{promised1..3}` (the navigator's reasons) and `{found1..3}` (the nomad's, in the order typed). No `{day}`.
  - `src/lib/encounters.ts`: `STARS`, `encounterFor(stars, index)` (wraps past the end), `randomEncounterIndex(stars)`, `starsLine(stars)` (`★★☆☆☆`), `encounterColor(stars)` (1 `alert`, 2 `hazard`, 3 `text`, 4 `phosphorDim`, 5 `phosphor`).
  - `src/lib/nomad-log.ts`: `fillTemplate(story, fill)` returns the story as pieces, `{ kind: 'text', text }` or `{ kind: 'redacted' }` for every missing reason or a gone navigator; `logDate(date)` ("October 15, 2026", local time); the `JournalEntry` type.
  - `src/lib/ratings.ts`: `rateStop`, `reachedStops`, `nomadLog` (database errors pass through), `isStars`, `reachedStop`, `reachedNote`, `blockedStop`, and `logEntry(row)` (a `nomad_log` row → `JournalEntry`, or `null` for unknown stars).
  - **RATE** (`reach-stop-panel.tsx`, `reach-stop`, headed "RATE · <TITLE>"; was CURRENT POSITION until WAB-53): a big glowing orange key **outside** the screens, in its own recessed well with a label tape (`road-rate-<external_id>`): beside the stop detail on wide ("RATE THIS STOP"), and under the strip map on narrow, rating whichever stop is open ("RATE THIS STOP"; with every stop folded shut it reads "OPEN A STOP TO RATE IT" and is disabled, `road-rate`) opens a `ShipModal`. Steps 1 · STARS and 2 · REASONS (`reach-step-*`). The form is a cream punch card (`reach-card`, Eben 2026-10-15): five star boxes (`reach-star-1..5`), and **no encounter preview**: the encounter is drawn at random when you press LOG IT, for the stars you ended on. NEXT: REASONS (`reach-to-reasons`) → "REASONS FOR RATING", Eben's help line (`reach-reasons-help`), FOUND 1 · REQUIRED and 2, 3 · OPTIONAL (`reach-reason-1..3`, underlined lines on the card), BACK TO STARS (`reach-back-to-stars`, keeps everything) and the orange **LOG IT** (`reach-log`, disabled while saving; errors in `reach-error`). After logging, the card flips (`scaleX`) to a CRT reveal (`reach-reveal`): the encounter flickers in (`reach-encounter`, `-stars`, `-title`, in the star color) above the filled-in story (`reach-reveal-story`, `reach-reveal-redacted`), then BACK TO THE ROAD (`reach-done`). The reveal credits the nomad whose page you're on; the saved log credits the first navigator, which only differs if two people plotted the same movie.
  - `log-entry.tsx`: `LogEntry` (`log-entry`, a button) prints on green-bar tractor-feed paper in a printer slot: `log-entry-stars` and `log-entry-title` (the encounter) as a bold first line, then the story (`log-entry-story`) with REDACTED bars (`log-entry-redacted`: near-black with small gray capitals; non-breaking spaces keep a bar from splitting across lines). Tap to flip to the star card, drawn as a punch card (`log-entry-back`): big stars, the encounter, the movie (`log-entry-media`), PLOTTED BY (`log-entry-navigator`), WHAT <NAVIGATOR> PROMISED (`log-entry-promised-heading`, `log-entry-promised-1..3`) and WHAT I FOUND (`log-entry-reason-1..3`), each listing only the reasons given. The flip squeezes `scaleX` to 0 and back (same on web and phones); reduce motion skips it.
  - `nomad-log.tsx`: `NomadLog` (props `channel`, `title`, `tape`, `rows`, `empty`, `testID`) is a `ShipPanel` of `LogEntry` cards, or the empty line (`<testID>-empty`). It shows the **3 most recent**; with more, a footer shows "3 OF 8" (`<testID>-count`), SHOW N MORE (`<testID>-more`, 3 at a time) and FOLD UP (`<testID>-fold`, back to 3). New sheets unfold like fanfold printer paper (`rotateX` from -90° with `perspective`, `transformOrigin: 'top'`, a shadow that fades as they flatten, 140 ms apart); FOLD UP folds them back in reverse, then removes them. Reduce motion skips both. The Adventure Page uses it twice: **LOG-01 · NOMAD'S LOG** with the tape **NAVIGATOR: <NAME>** (`nomad-log`) under your road, and **LOG-02 · FIELD REPORTS** with the tape **NOMAD: <NAME>** (`field-reports`) under the Nav Console. On phones they sit under the road and the console in their own tabs.
  - Not built: sharing (WAB-49), rewatch (WAB-50), reroute (WAB-51), OVERALL JOURNEY (WAB-52), and "stops behind you" on the road map.
- Unused Expo template components and images were deleted. Still in place: `src/hooks/use-color-scheme.web.ts` (used, but its hydration guard is pointless now that output is `"single"`).

Eben clicked through on web (2026-10-07): Paul sends Bart a request, Bart sees it in CH-02 and accepts, and both show up in each other's Fellow Nomads list with their pictures.

**Local data:** Eben's Mac was reset on 2026-10-15 (the `watched_on` change), then rebuilt by hand: Bart and Paul are connected, Paul plotted Mad Max: Fury Road, Mad Max 2 and Tremors for Bart, and Bart plotted They Live for Paul. Bart logged all three of Paul's stops and Paul logged They Live, so Bart's road is empty and both log panels have entries. Jake's Mac needs one `npx supabase migration up` after pulling WAB-44.

## Next steps

1. **Merge WAB-44** (Jake reviews).
2. **Pick the next wasteland piece** with Eben: WAB-49 (share as styled text), WAB-51 (reroute), WAB-52 (OVERALL JOURNEY). WAB-50 (rewatch) is parked.
3. **Deploy for friends (WAB-45)** whenever it's wanted.
4. **Manual test plan:** [`docs/manual-test-plan.md`](docs/manual-test-plan.md) lists everything built so far as click-through checks, with the testIDs each one touches. Add checks in the same PR as each feature. When Playwright covers a check, delete it from the plan.
5. **Playwright** end-to-end tests against the web build, signing in as the seed users through the dev email form. Every interactive element has a `testID` (`data-testid` on web). Good first flows: sign in → Basecamp; Paul asks Bart → Bart accepts → both lists; Paul plots a stop → Bart logs it → the entry shows in Bart's log and Paul's field reports. A test image for the file picker goes in `e2e/fixtures/` (not `assets/`, which ships with the app; keep it small). Decide whether WAB-34 closes.
6. **Series search (WAB-16):** TMDB `/search/tv`, `external_id` `tv:<id>`, `type: 'series'`, recorded fixtures first. `MediaSearch` already takes a `type`. Then decide on the TMDB logo for `TmdbAttribution`.
7. Sign-in error states and phones (WAB-6): phones need a development build for a stable OAuth redirect. On that build, also check that `uploadAvatar` can read the photo's bytes (`fetch(uri)` works on web).
8. When building "change avatar": add a version to the avatar URL (e.g. `?v=<timestamp>`) so browsers don't keep showing the old picture.
9. Housekeeping: `npx expo install --check` wants patch updates for `expo`, `expo-constants`, `expo-router`, `@expo/ui`. `expo-symbols`, `expo-web-browser` and `expo-image` are no longer used by any code. Do both carefully because of the lockfile gotcha.

## What this is

Friends recommend movies, series and books to each other. Your friends know what you'll actually connect with. The product is the recommendation itself, and eventually knowing *whose* recommendations are reliably right for you. It should feel like an adventure between two friends: a community with zero advertising. Eben wants it **lightweight**: get opinionated later, once we know more.

## Vocabulary (from WAB-13)

**Being replaced by WAB-39's wasteland words** (navigator, nomad, route, encounter, reroute, Nomad's Log). WAB-13 gets updated once Eben and Jake settle the open ones. The table below is the old vocabulary.

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
- **The list belongs to the sherpa**: one per sherpa, per pilgrim, per media type ("Eben's movie list for Jake"). Hard cap of **3 active picks** (was 5 until 2026-10-08). Sherpa adds, removes, reorders, edits reasons; the pilgrim can't edit it.
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
- **Code names vs glossary names:** decided for connections: plain names in the schema (`nomad_connections`, `requester_id`, `addressee_id`), never "friendships" and no sherpa/pilgrim in table names. Recommendations should follow the same idea.
- **Seeded avatar URLs** hard-code `http://127.0.0.1:54321`. Fine locally; a hosted project would need its own seed.
- **Sherpa Scoring and Media Scoring formulas.**

## Conventions (Eben's rules; also in his global CLAUDE.md)

- **Strict red → green → refactor.** Write the test, watch it fail for the right reason, then the least code to pass. pgTAP for every table, policy and function; Jest for app code; `deno test` for edge functions. When a "can't do X" test passes before the code exists, break the code on purpose once to prove the test catches it.
- **Build slowly**, one small piece at a time, run it right away. Eben stops things when they move too fast; check in before big moves (that's how the schema restart happened, and it was the right call).
- **Every interactive element gets a `testID`** (for Playwright later). Use `ShipButton` (or `ActionButton` on the older screens) for buttons.
- **Tests check real values**, not shapes: exact arguments, exact messages, call counts. If a test passes before the code exists, break the code on purpose once to prove the test can fail.
- **Playwright is planned (after WAB-34), and we are prototyping fast** (decided by Jake 2026-10-01). Unit tests that only check how things look or are wired together (which font a text style uses, which colors the theme holds, which screen shows while fonts load) are overkill for now. Keep unit tests for logic, data and security: database rules, edge functions, hooks and `src/lib/`. When a test would really be checking what someone sees on screen, write it as a Playwright test once Playwright is set up, and move existing ones like that over then.
- **Test data uses Taffy Lee Fubbins (`taffy-lee-fubbins`) and Roy Donk (`roy-donk`)**, never the team's own names (Eben, Jake, other developers). Characters and cast from *I Think You Should Leave* are fine, photos included; the seed users' avatars are ITYSL pictures.
- No `any`, enforced by lint (`no-explicit-any` plus the `no-unsafe-*` rules, which catch `any` leaking in from libraries). No comments unless asked. No `console.log`.
- Only `src/lib/supabase.ts` may call `createClient` (lint enforces it).
- **Eben names every commit.** Summarize what's in it and ask for the title. Never mention AI or Claude in commits, PRs or code (attribution is turned off in Eben's Claude settings). Never `git add .`. Run tests before committing.
- **Work in small steps and check in.** Red and green together per test, then stop for Eben to look and name the commit. Show test results in code blocks.
- Never hard-code a color in a component: colors come from the theme (WAB-31), so a whole new theme is one file. A new color becomes a named role in `theme.ts`. Shadows and glows build their color from a role too (``boxShadow: `0px 4px 0px ${theme.edge}` ``). Quick check: `grep -rnE "#[0-9A-Fa-f]{3,8}\b|rgba?\(" src/components src/app` should find nothing.
- `npx expo install` for packages. Check the versioned Expo docs (`https://docs.expo.dev/versions/v57.0.0/`) before using an Expo API.
- **Explain Expo (and Supabase) concepts as we go**; Eben and Jake are learning. Short "Expo note" asides tied to what was just done work well.

## Gotchas learned this session

- **WAB-26:** Postgres gives every new function EXECUTE for PUBLIC, so `anon` can call it. Every migration that adds a function must `revoke execute on function ... from public, anon` and have an "anon cannot call" test.
- **Storage rows can't be deleted with plain SQL** (`storage.protect_delete` trigger). In pgTAP, `select set_config('storage.allow_delete_query', 'true', true);` first, which is what the Storage API does.
- `tests.user_id` reads `auth.users`, so it's `security definer`; otherwise it fails when acting as a signed-in user.
- Jest can't import CSS: `package.json` maps `\.css$` to `jest/style-stub.js` (the template theme imports `global.css`).
- `renderRouter('src/app')`: the path is relative to the project root (it resolves from `process.cwd()`).
- Don't call Supabase from *inside* `onAuthStateChange`; it can deadlock. The provider defers with `setTimeout(..., 0)`.
- RNTL v14: `render`, `renderHook` and `fireEvent` are async; `await` them. A missing `await` on `fireEvent.press` can pass its own test and then fail **every later test in the file** (they find the wrong screen).
- `package-lock.json`: this machine's npm 10 strips `libc` fields from Linux optional deps (and flips `fsevents` to `dev`). After `npx expo install`, rebuild the lockfile from `HEAD` plus only the new package entries; the `expo-image-picker` commit (`d27942c`) shows the result: 22 lines added, nothing removed.
- **After any migration that changes tables or functions, run `npm run db:types`** and commit `src/lib/database.types.ts` with it.
- Untyped Supabase calls return `any`, which TypeScript happily accepts. That's why the client is typed and lint has the `no-unsafe-*` rules.
- Use `globalThis`, not `global` (no Node types in this project), e.g. `jest.spyOn(globalThis, 'fetch')`.
- `routing.test.tsx` renders real route files. When a route starts importing a `src/lib/` module that touches Supabase or a native module, fake that module there, or Jest crashes on `expo-sqlite`.
- Tests that use `jest.useFakeTimers()` rely on an `afterEach(() => jest.useRealTimers())`, so a failing test can't leak the fake clock.
- Sorting: `order by username` uses `en_US` collation, so `roy-donk` sorts before `Taffy`.
- **Never hand-make local users with an `@test.local` email.** The database tests' `tests.create_user('roy')` makes `roy@test.local`, and a leftover user with the same email breaks every test file that creates Roy (`duplicate key value violates unique constraint "users_email_partial_key"`). The seed users use `@dev.local` for this reason; keep it that way for any new ones.
- **Two `.env` files, on purpose.** The root `.env` is for the app and `config.toml` (Supabase URL and publishable key, Google sign-in). `supabase/functions/.env` is only for edge functions (`TMDB_API_TOKEN`). Keep server keys out of the root one. After editing `supabase/functions/.env`, restart `functions serve`; it only reads the file at start.
- **TMDB needs the long "API Read Access Token"** (starts with `eyJ`), not the short 32-character "API Key": `media-search` sends it as `Authorization: Bearer …`. A missing or wrong token shows in the app only as "Search is having trouble"; the `functions serve` window has the real error.
- **Database tests must not assume empty tables** (WAB-35). Local databases hold real sign-ups, avatars and cached search results. Scope checks to the test's own users, and when a test inserts a row with a real id (like `movie:600`), delete any existing one first inside the test's transaction; the `rollback` puts it back.
- `supabase.functions.invoke` returns `any`. Assert the response type (`as SearchResponse`); a type annotation alone doesn't satisfy `no-unsafe-assignment`.
- `deno check` on an edge function from the repo root gets confused by the app's `node_modules` (it looks there for `npm:` packages). The real check is `npx supabase functions serve`, which runs Supabase's own runtime. `deno test` is unaffected.
- Edge function tests import JSON fixtures with `import x from './fixtures/x.json' with { type: 'json' };`.
- **Postgres won't take `position` as a column name in `returns table (...)`** (syntax error). Use another word (`rank`).
- **macOS `sed` has no `\b`.** A `sed -E 's/\bword\b/.../'` silently matches nothing. Use `perl -pi -e` for word-boundary edits.
- **`renderRouter` in RNTL 14 returns a promise with extras on it.** `await renderRouter(...)` loses `getPathname()`. Keep the result, then await it: `const router = renderRouter('src/app'); await router; router.getPathname()`.
- **After `npx supabase db reset`, running one pgTAP file on its own fails** with `schema "tests" does not exist`. The reset wipes the helper schema, and only `00000-test-helpers.sql` recreates it. Run the whole suite (`npm run test:db`) once first.
- **Design canvases use tape-label tiles for covers.** In the app, covers come from TMDB through `MediaPoster` (`src/components/media-poster.tsx`).
- **Changing a database function that's already applied: add a new migration** with `create or replace function …` (it keeps the function's grants, so the `anon` revoke still holds). Editing an applied migration means everyone needs a `db reset`. A migration you're still iterating on can be re-applied by hand: `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f <file>`. A fresh `db reset` before committing proves the migrations apply in order.
- **Breaking code on purpose for a pgTAP test** without touching files: pipe an altered copy of the function through `psql` (e.g. `sed … migration.sql | psql …`), run `npm run test:db`, then re-apply the real migration file the same way.
- **React Query in Jest:** a test `QueryClient` needs `gcTime: Infinity` (plus `retry: false`), or React Query's 5-minute cleanup timer keeps Jest running after the tests finish. Tests with fake timers (`use-media-search`) don't hit it.
- **macOS has no `timeout` command.** `timeout 60 npx jest` fails instantly and looks like a hang. Use `perl -e 'alarm 60; exec @ARGV' npx jest …`.
- **`test:functions` runs `deno test --no-lock`** and `deno.lock` is gitignored: Deno kept rewriting the lock file differently on each Mac.
- **Shadows:** use `boxShadow` (works on web and phones in React Native 0.86 with the New Architecture). The old `shadow*` props warn on web. Text glows still use `textShadowColor` / `textShadowRadius`: React Native has no `textShadow` shorthand on phones, so the web-only "textShadow* style props are deprecated" warning is expected.
- **Storage seeding:** `[storage.buckets.<name>]` with `objects_path` in `config.toml` uploads that folder on `npx supabase db reset` (after `seed.sql`). Keep the bucket's rules there identical to its migration.
- **pgTAP tests can't read `recommendations` directly** (every privilege is revoked), so a test acting as a signed-in user gets `42501 permission denied` if it looks up a stop's id with `select … from public.recommendations`. Look the ids up before authenticating, into a temp table granted to `authenticated` and `anon` (see `replace-recommendation.test.sql`'s `stops`).
- **The routing test fakes `@/lib/scan-line`** because the road map now loads it, and it loads `expo-sqlite`. Any new `src/lib/` module that touches storage or a native module needs the same fake in `routing.test.tsx`; otherwise the whole file fails to load (`NativeDatabase is not a constructor`) and Jest's total quietly drops.
- **Prettier isn't set up**, and the files aren't Prettier-formatted, so don't run `npx prettier --write` on a file: it reformats all of it. Indent by hand.
- **`npx supabase db reset` stops `supabase functions serve`.** The reset restarts the containers, and search then answers `503 name resolution failed` ("Search is having trouble" in the app). Restart `npx supabase functions serve --env-file supabase/functions/.env` after every reset. A reset also wipes local data; prefer `migration up` for new migrations.
- **`npx supabase migration new <name>` hangs when its input is piped** (it waits on stdin). Run it with `</dev/null`, then write the file.
- **pgTAP and "first by `created_at`":** rows made in one test transaction can share a `now()`-style timestamp. `stop_ratings.created_at` uses `clock_timestamp()` so ratings in one transaction still order; when a test depends on which recommendation came first, bump one row's `created_at` in the setup.
- **A styled word inside text** (the REDACTED bar) is a nested `Text`. Pad it with non-breaking spaces (`\u00A0`); plain spaces let the browser break the line inside the bar and leave a black sliver behind.
- **RNTL 14 accessibility matchers:** `toBeExpanded()` / `toBeCollapsed()` (and friends), not `toHaveAccessibilityState`.
- **Test files that import `src/lib/ratings.ts` (or anything that reaches `src/lib/supabase.ts`) must fake `@/lib/supabase`** (`jest.mock('@/lib/supabase', () => ({ supabase: {} }))`), or Jest crashes on `expo-sqlite`. Components inside `ShipModal` also need the `react-native-safe-area-context` jest mock (see `reach-stop-panel.test.tsx`).
- **Gradients and textures (WAB-53):** React Native 0.86 draws `linear-gradient` and `radial-gradient` on phones through `experimental_backgroundImage` (plus `experimental_backgroundSize` and `experimental_backgroundRepeat`), but **not `repeating-linear-gradient`**, and the web renderer ignores the `experimental_` keys. `textureStyle()` hands phones the experimental keys and the web plain CSS `backgroundImage`; repeat a small tile with a `size` instead of using a repeating gradient (that's how scanlines and green-bar paper work). Put textures on their own absolute, `pointerEvents="none"` overlay view.
- **Writing a `\u00A0` escape with the file tools can land as the real non-breaking character.** Either is fine in a JS string; check with `od -c` if a REDACTED bar starts splitting again.
- **Removing a package by hand** (to dodge the lockfile gotcha): delete its line from `package.json`, its entry from the root `packages[""].dependencies` and its `node_modules/<name>` block in `package-lock.json`, then the folder in `node_modules`. WAB-53 did this for Michroma.
- **Removing the browser's focus ring on a `TextInput` (web)** takes `outlineStyle: 'solid'` plus `outlineWidth: 0`. `outlineWidth: 0` alone does nothing, because the browser's own focus style is `outline-style: auto`, which ignores the width. Always give focus another visible signal (the search field lights its border).

## Design

### Mockups

The canvases are the source of truth for how screens should look; there are no copies in git, so they can't go stale. Link a new canvas here and on its Linear ticket, and share it with the other person from the canvas's **Share** menu.

| Canvas | What's on it | Status | Owner | Linked from |
|---|---|---|---|---|
| [Basecamp](https://claude.ai/artifact/McuDsyS912uQUoDSAKoW7K) | The ship-computer look: Basecamp on web and phone, the "no nomads yet" empty state, and the Adventure Page on a phone | **Current** | Jake | WAB-33, WAB-14, WAB-31 |
| [Wasteland Adventure Map](https://claude.ai/artifact/VXnLDmWxEd7C8DUYtg14Mx) | The Adventure Page as a road map: your road (web and phone), the Nav Console, field reports, the encounters field guide, and Plot a stop (web, phone, and the panel on its own). Sticky notes hold Eben's and Jake's decisions | **Current** (2026-10-08) | Eben | WAB-39 to WAB-44 |
| [Adventure Page](https://claude.ai/artifact/2kVf1bEuKMdUR9h8p14bAA) | The first Adventure Page mockup, in the old purple palette with Bricolage Grotesque and Figtree. Eben's and Jake's notes are in WAB-14 | **Outdated** (the layout ideas still hold; the look doesn't) | Eben | WAB-14 |

**Direction:** bold, exciting, fun. A muted, earthy first try was rejected. Letting each nomad pick their own colors is a 2.0 idea.

**The Crawler Bridge look** (Eben and Jake, 2026-10-15, WAB-53; replaces the ship-computer look): a land-based Nostromo from *Alien*. Clunky tech, small monochrome screens surrounded by toggles and keys, gritty and lived-in like Star Wars, never kitschy like Fallout. The [Crawler Bridge canvas](https://claude.ai/artifact/4tmxFsCLaaFf8ZcH1Xnfij) is the source of truth. Worn cream plastic consoles with screws on a dark grimy hull, label-maker tapes, pictogram plates, amber readouts and indicator lamps, bezelled CRTs with scanlines, chunky keys that press down, a wireframe terrain road map, log entries on green-bar printer paper that flip to punch cards. Eben and Jake cut the canvas's cassette slots for the classic Nav Console list. Fonts: **Barlow Condensed** (headings, keys, tapes), **Space Mono** (labels and printed text), **VT323** (anything on a screen).

- In code: `Colors` and `Typefaces` in `src/constants/theme.ts`. Light and dark mode both use the same palette. Every color is a role; the main ones: `background` (hull), `backgroundElement` (cream panel), `panelEdge`, `edge` (drop shadows), `text`/`textSecondary` (light, on the hull), **`ink`/`inkSecondary` (dark, on cream: use these for any text sitting on a panel)**, `screen`, `bezel`, `phosphor`, `phosphorDim`, `amber`/`amberScreen` (readouts), `hazard`, `alert`, `signal` (pictogram blue), `you` (amber), `friend`, `onAccent`, `tape`/`tapeText`, `paper`/`paperBar`/`printInk`, `card`/`cardInk`, `lampOff`, `keyTop`/`keyShadow`, and the translucent texture roles `sheen`, `shade`, `scanline`, `vignette`, `grime`, `grid`. `neon` is gone.
- Shared pieces in `ship-panel.tsx`: `ShipPanel` (props `channel`, `title`, `icon`, `tape`, `badge`; title reads "<CHANNEL> · <TITLE>"), `Screws`, `Plate`, `Tape`, `PictogramPlate` (`up`, `page`, `crosshair`, `warning`, `bars`, drawn from plain views), `Lamp`, `Readout`, `CrtScreen` (bezel, scanlines, vignette), `ShipButton` (keys: `hazard`, `phosphor` glows, `panel`, `alert`), `ScreenLine`, `HazardStripe`.
- Textures come from `src/lib/textures.ts`: `textureStyle({ image, size })` and `scanlines(color)`. See Gotchas for why.

## Environment (Mac, verified 2026-10-01)

- Node v22.20.0, npm 10.9.3, Deno (Homebrew), Docker Desktop (must be running before `supabase start`), `gh` CLI (installed and logged in 2026-09-28).
- Root `.env`: Supabase URL and publishable key, plus the two Google variables.
- `supabase/functions/.env`: `TMDB_API_TOKEN` must be set for `media-search` (each developer makes their own: themoviedb.org → Settings → API → "API Read Access Token"). `HARDCOVER_API_TOKEN` is unused until book search.
- Jake's Mac (2026-10-01): Node v26 and Deno 2.9 from Homebrew, OrbStack instead of Docker Desktop.
- Studio http://127.0.0.1:54323. Web dev server: `npx expo start --web` on http://localhost:8081.

| Command | Result |
|---|---|
| `npm test` | 229 passed, 28 files |
| `npm run test:functions` | 18 passed, 2 files |
| `npm run test:db` | 144 passed, 13 files |
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

The steps are in [README.md](README.md). Get the Google client id and secret from Eben through a password manager, never chat or git. Jake must be a test user on the Google consent screen.
