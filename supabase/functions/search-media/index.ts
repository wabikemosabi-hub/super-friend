// Searches every media provider in parallel, normalizes the results into one
// shape, caches them in `media_items`, and returns the cached rows (with our ids).
//
// Secrets (supabase secrets set ...):
//   TMDB_API_TOKEN       TMDB "API Read Access Token" (v4 bearer)
//   HARDCOVER_API_TOKEN  optional; without it books come from Open Library

import { createClient } from 'jsr:@supabase/supabase-js@2';

type MediaType = 'movie' | 'series' | 'book';

type NormalizedMedia = {
  type: MediaType;
  provider: 'tmdb' | 'hardcover' | 'openlibrary';
  external_id: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  image_url: string | null;
  overview: string | null;
  metadata: Record<string, unknown>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USER_AGENT = 'MediaAdvisoryBoard/0.1 (search-media edge function)';

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

async function searchTmdb(query: string, types: MediaType[]): Promise<NormalizedMedia[]> {
  const token = Deno.env.get('TMDB_API_TOKEN');
  if (!token || !(types.includes('movie') || types.includes('series'))) return [];

  const url = new URL('https://api.themoviedb.org/3/search/multi');
  url.searchParams.set('query', query);
  url.searchParams.set('include_adult', 'false');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);

  const body = await res.json();
  const results: NormalizedMedia[] = [];

  for (const r of body.results ?? []) {
    const type: MediaType | null =
      r.media_type === 'movie' ? 'movie' : r.media_type === 'tv' ? 'series' : null;
    if (!type || !types.includes(type)) continue;

    const date: string | undefined = r.release_date || r.first_air_date;
    results.push({
      type,
      provider: 'tmdb',
      external_id: `${r.media_type}:${r.id}`,
      title: r.title ?? r.name,
      subtitle: null,
      year: date ? Number(date.slice(0, 4)) : null,
      image_url: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
      overview: r.overview || null,
      metadata: {
        backdrop_url: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null,
        popularity: r.popularity,
        vote_average: r.vote_average,
        original_language: r.original_language,
      },
    });
  }
  return results;
}

async function searchHardcover(query: string, token: string): Promise<NormalizedMedia[]> {
  const res = await fetch('https://api.hardcover.app/v1/graphql', {
    method: 'POST',
    headers: {
      authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': USER_AGENT,
    },
    body: JSON.stringify({
      query: `query Search($q: String!) {
        search(query: $q, query_type: "Book", per_page: 10, page: 1) { results }
      }`,
      variables: { q: query },
    }),
  });
  if (!res.ok) throw new Error(`Hardcover ${res.status}`);

  const body = await res.json();
  const hits = body.data?.search?.results?.hits ?? [];

  return hits.map(({ document: d }: { document: any }) => ({
    type: 'book' as const,
    provider: 'hardcover' as const,
    external_id: String(d.id),
    title: d.title,
    subtitle: (d.author_names ?? []).slice(0, 2).join(', ') || null,
    year: d.release_year ?? null,
    image_url: d.image?.url ?? null,
    overview: d.description ?? null,
    metadata: {
      slug: d.slug,
      pages: d.pages,
      rating: d.rating,
      genres: d.genres,
      moods: d.moods,
      series: d.featured_series?.series?.name ?? null,
    },
  }));
}

async function searchOpenLibrary(query: string): Promise<NormalizedMedia[]> {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '10');
  url.searchParams.set('fields', 'key,title,author_name,first_publish_year,cover_i,subject');

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Open Library ${res.status}`);

  const body = await res.json();
  return (body.docs ?? []).map((d: any) => ({
    type: 'book' as const,
    provider: 'openlibrary' as const,
    external_id: d.key,
    title: d.title,
    subtitle: (d.author_name ?? []).slice(0, 2).join(', ') || null,
    year: d.first_publish_year ?? null,
    image_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
    overview: null,
    metadata: { subjects: (d.subject ?? []).slice(0, 5) },
  }));
}

async function searchBooks(query: string, types: MediaType[]): Promise<NormalizedMedia[]> {
  if (!types.includes('book')) return [];
  const token = Deno.env.get('HARDCOVER_API_TOKEN');
  if (token) {
    try {
      return await searchHardcover(query, token);
    } catch (err) {
      console.error('Hardcover failed, falling back to Open Library', err);
    }
  }
  return searchOpenLibrary(query);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { query, types } = (await req.json()) as { query?: string; types?: MediaType[] };
    const q = query?.trim();
    if (!q) return json({ results: [] });

    const wanted: MediaType[] = types?.length ? types : ['movie', 'series', 'book'];

    const settled = await Promise.allSettled([searchTmdb(q, wanted), searchBooks(q, wanted)]);
    const seen = new Set<string>();
    const found = settled
      .flatMap((s) => {
        if (s.status === 'rejected') console.error(s.reason);
        return s.status === 'fulfilled' ? s.value : [];
      })
      // A single upsert can't touch the same row twice.
      .filter((m) => {
        const key = `${m.provider}|${m.external_id}`;
        return !seen.has(key) && !!seen.add(key);
      });

    if (found.length === 0) return json({ results: [] });

    // Service role: media_items is read-only for app users.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await admin
      .from('media_items')
      .upsert(
        found.map((m) => ({ ...m, fetched_at: new Date().toISOString() })),
        { onConflict: 'provider,external_id' },
      )
      .select();
    if (error) throw error;

    // Preserve provider ranking, interleaving screen and page results.
    const byKey = new Map(data.map((row) => [`${row.provider}|${row.external_id}`, row]));
    const screen = found.filter((m) => m.type !== 'book');
    const books = found.filter((m) => m.type === 'book');
    const ordered = [];
    for (let i = 0; i < Math.max(screen.length, books.length); i++) {
      if (screen[i]) ordered.push(byKey.get(`${screen[i].provider}|${screen[i].external_id}`));
      if (books[i]) ordered.push(byKey.get(`${books[i].provider}|${books[i].external_id}`));
    }

    return json({ results: ordered.filter(Boolean) });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
