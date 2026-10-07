# Media Advisory Board

Friends recommend movies, series and books to each other. Your friends know what you'll actually connect with, so the app is built around the recommendation itself, and eventually around knowing *whose* recommendations are reliably right for you. No ads, no algorithm feed: just you and your fellow nomads.

Built with Expo (SDK 57, Expo Router, web first) and Supabase (Postgres, auth, storage, edge functions). Movie data comes from TMDB.

**Working on it?** Read [HANDOFF.md](HANDOFF.md) for where things stand, the decisions made and the gotchas. Tickets live in Linear (team Wabikemosabi, project Media Advisory Board).

## You need

- Node 22 or newer, and npm
- Docker Desktop or OrbStack, running (local Supabase runs in containers)
- Deno, for the edge function tests: `brew install deno`
- A TMDB "API Read Access Token" for movie search: themoviedb.org → Settings → API (the long token that starts with `eyJ`, not the short API key)

## Set up

```sh
git clone https://github.com/wabikemosabi-hub/super-friend.git && cd super-friend
npm install
cp .env.example .env
cp supabase/functions/.env.example supabase/functions/.env
npx supabase start
npx supabase db reset
npx expo start --web
```

- **Root `.env`:** the Supabase URL and publishable key (`npx supabase status` prints them), plus the Google sign-in client id and secret (ask Eben; shared through a password manager, never chat or git).
- **`supabase/functions/.env`:** your own `TMDB_API_TOKEN`.
- **`npx supabase db reset`** builds the local database from the migrations, then seeds it: two test nomads, `bart-harley-jarvis@dev.local` and `paul-bufano@dev.local`, with avatars. Their password is in `supabase/seed.sql`. In development, the sign-in screen has a "DEV ONLY: test nomads" form for them, so you don't need Google to try things.
- **Movie search** also needs the edge function running: `npx supabase functions serve --env-file supabase/functions/.env`.

The app runs at http://localhost:8081 and Supabase Studio at http://127.0.0.1:54323.

## Commands

| Command | What it does |
|---|---|
| `npx expo start --web` | Run the app on the web |
| `npm test` | Jest unit tests (app code) |
| `npm run test:functions` | Deno tests for the edge functions |
| `npm run test:db` | pgTAP tests for the database (needs Supabase running) |
| `npm run test:all` | All three |
| `npx tsc --noEmit` | Typecheck |
| `npx expo lint` | Lint |
| `npm run db:types` | Regenerate `src/lib/database.types.ts` after a migration |
| `npx expo install <package>` | Add a package (picks versions that match the Expo SDK) |

## After you pull

See "After you pull" in [HANDOFF.md](HANDOFF.md). In short: `npm install`, `npx supabase migration up`, and `npx supabase db reset` whenever the seed changed.
