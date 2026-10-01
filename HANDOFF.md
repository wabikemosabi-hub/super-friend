# Handoff: Media Advisory Board

_Last session: 2026-09-30 (Mac). We deleted the old database and started over, smaller. Google sign-in works on the web, end to end, clicked through by Eben. Next up: the real "pick a username and avatar" screen (WAB-29)._

## Start here

**Linear is the source of truth, not this document.** The Linear MCP server is authenticated. Read these before touching code:

| Ticket | What it is |
|---|---|
| **WAB-13 Glossary** | The vocabulary. Use these words in UI copy and tickets |
| **WAB-6 Sign In with Google** | In progress. Works on web; has a Status section |
| **WAB-29 Pick a Username and Avatar** | In progress. **Next task.** Database side done; the screen is a placeholder |
| **WAB-33 Basecamp** | In progress. Where you land after sign-in; built from cards. Placeholder for now |
| WAB-14 Adventure Page | The page between two nomads. Has a "Decisions" section |
| WAB-15 Media Context Page | One piece of media: rate it or pass on it |
| WAB-8 Sherpa Recommendation System | Overview. Sub-tickets WAB-16 to WAB-24 (search, recommend, reasons, ranking, rating, pass, scores, tagging) |
| WAB-9, 10, 11, 30 | Fellow Nomads: add, accept or decline, open an Adventure Page, remove or block. **Need rebuilding** (see below) |
| WAB-31 Theme Colors | Every color from a named role in one theme file |
| WAB-26 | New database functions are callable by `anon`. Parked, but every new function must revoke it (see Gotchas) |
| WAB-27 Stickers (2.0), WAB-24 Tagging (later) | Backlog |

Closed: WAB-32 (typecheck and lint, done), WAB-25 (schema reconciliation, superseded by the restart), WAB-28 (moot), WAB-12 (duplicate of WAB-14), WAB-7 (archived on purpose), WAB-1 to WAB-4 (Linear samples).

The Adventure Page mockup: https://claude.ai/artifact/2kVf1bEuKMdUR9h8p14bAA (attached to WAB-14).

## Where things stand

Branch `ebenbsmith/wab-6-log-in`. What exists, all test-first:

**Database** (two migrations, both new on 2026-09-28/30; the old schema is deleted):

- `profiles`: `id` (references `auth.users`, cascades), `username` (3 to 24 letters, numbers or underscores; unique ignoring case), `avatar_url` (nullable). Signed-in users read everyone's; you can only create your own and only update `username` / `avatar_url`. **No trigger**: the app creates the profile when you pick a username. 12 pgTAP tests.
- `avatars` storage bucket: public to read, `image/*` only, 5 MB. You can only upload, replace or delete inside `avatars/<your user id>/`. 10 pgTAP tests.
- **Nothing else.** No friendships, media, recommendations yet.

**Auth:**

- Google OAuth client exists (Google Cloud project made by Eben, testing mode, Eben and Jake as test users). Creating it costs nothing; ignore the "$300 free trial" banner.
- Local Supabase reads the client from the root `.env` (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, gitignored). `supabase/config.toml` has `[auth.external.google]`, `site_url = "http://localhost:8081"`, redirects allowed to `http://localhost:8081/**`.
- Google console redirect URI: `http://127.0.0.1:54321/auth/v1/callback`; JS origin `http://localhost:8081`. A hosted Supabase project will need its own callback URI added there.

**App:**

- `app.json` `web.output` is `"single"` (a single-page app; static rendering broke auth).
- `src/lib/supabase.ts` reads the sign-in result from the URL on web (`detectSessionInUrl: Platform.OS === 'web'`).
- `src/lib/auth.ts`: `signInWithGoogle(returnTo)`, `signOut()`. Tested.
- `src/providers/session-provider.tsx`: `useSession()` returns `{ status, session, profile }`, status one of `loading`, `signedOut`, `needsProfile`, `ready`. Tested with a fake Supabase.
- `src/app/_layout.tsx`: `SessionProvider` + `Stack.Protected`. Signed out → `sign-in`; no profile → `pick-username`; ready → `index` (Basecamp). Splash stays up while loading. Routing tested with `expo-router/testing-library` (`renderRouter('src/app')`), including that a signed-out visitor can't reach Basecamp.
- Screens live in `src/components/` as plain components taking props (`SignInScreen`, `PickUsernameScreen`, `BasecampScreen`); route files in `src/app/` are thin wrappers. `ActionButton` is the shared button and **requires** a `testID`.
- Pick-username and Basecamp are placeholders with a sign-out button.
- Removed template bits: `explore` route, the tab bar (`app-tabs*`). Still-unused template files: `animated-icon*`, `hint-row`, `web-badge`, `external-link`, `src/components/ui/`, and `src/hooks/use-color-scheme.web.ts` (its hydration guard is pointless now that output is `"single"`). Safe to delete when convenient.

Eben clicked through on web: Continue with Google → back on "Pick a username" → refresh keeps you signed in → sign out → back to the button; typing `/pick-username` while signed out bounces to sign-in.

## Next steps

1. **WAB-29, the real pick-a-username screen.** Username field with the same rule as the database (`^[a-zA-Z0-9_]{3,24}$`), "taken" handling (unique violation `23505`, ignoring case), avatar from the camera roll with `expo-image-picker` (a file picker on web; `npx expo install` it), upload to `avatars/<user id>/...`, then insert the profile and refresh the session state so the guard moves you to Basecamp. Test-first: validation as a pure function, the screen with props, and the session provider needs a way to re-check the profile after it's created.
2. **Playwright.** Eben wants end-to-end tests against the web build. Every interactive element already has a `testID` (rendered as `data-testid` on web). Google sign-in can't be automated against real Google; plan on a test-only way to get a session (e.g. a local Supabase user signed in via the API) for E2E.
3. **Friendships (WAB-9, 10, 30), then the Fellow Nomads List card on Basecamp (WAB-33).**
4. Sign-in error states and phones (WAB-6): phones need a development build for a stable OAuth redirect.

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
- No `any`. No comments unless asked. No `console.log`.
- Never mention AI or Claude in commits, PRs or code. Casual commit messages. Never `git add .`. Run tests before committing.
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
- `package-lock.json`: this machine's npm 10 strips `libc` fields from Linux optional deps. When adding a package, commit only its own lockfile entries. `deno.lock` has a small uncommitted change; leave it.
- `git stash@{0}` holds obsolete email/password validation from before the switch to Google. Safe to drop.

## Design

The mockup (link above) shows the Adventure Page on a phone. Eben and Jake called it a visually acceptable first pass; their notes are in WAB-14.

**Direction:** bold, exciting, fun. A muted, earthy first try was rejected. Jake is researching a new palette; letting each nomad pick their own colors is a 2.0 idea. The theme roles and current values are in WAB-31. Mockup fonts: Bricolage Grotesque (headings) and Figtree (body). The current screens still use the template's plain theme.

## Environment (Mac, verified 2026-09-30)

- Node v22.20.0, npm 10.9.3, Deno (Homebrew), Docker Desktop (must be running before `supabase start`), `gh` CLI (installed and logged in 2026-09-28).
- Root `.env`: Supabase URL and publishable key, plus the two Google variables.
- `supabase/functions/.env`: `TMDB_API_TOKEN` and `HARDCOVER_API_TOKEN` are blank. The `search-media` edge function has never run, and it caches into a `media_items` table that no longer exists (WAB-16).
- Studio http://127.0.0.1:54323. Web dev server: `npx expo start --web` on http://localhost:8081.

| Command | Result |
|---|---|
| `npm test` | 24 passed, 7 files |
| `npm run test:functions` | 1 passed (harness only) |
| `npm run test:db` | 23 passed, 3 files |
| `npx tsc --noEmit` | passes |
| `npx expo lint` | passes |

## Platform decisions

| Area | Decision | Why |
|---|---|---|
| App | **Expo SDK 57 + Expo Router**, one codebase; **web first** for now | Fastest route to web and phones |
| Backend | **Supabase** (Postgres, auth, storage, RLS, edge functions) | RLS handles who-sees-what; edge functions keep API keys server-side |
| Auth | **Google only**, via Supabase | No passwords to manage; lightweight sign-up |
| Data fetching | **@tanstack/react-query** (installed, not wired up) | Caching and invalidation after mutations |
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

Get the Google client id and secret from Eben through a password manager, never chat or git. Jake must be a test user on the Google consent screen. Deno is needed for `npm run test:functions` (`brew install deno`).
