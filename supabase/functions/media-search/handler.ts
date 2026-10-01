import { MEDIA_TYPES, type MediaItem, type MediaType, type NewMediaItem } from '../_shared/media.ts';

export type MediaSearchDeps = {
  isSignedIn: (authorization: string | null) => Promise<boolean>;
  searchMovies: (query: string) => Promise<NewMediaItem[]>;
  cache: (items: NewMediaItem[]) => Promise<MediaItem[]>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handleMediaSearch(req: Request, deps: MediaSearchDeps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (!(await deps.isSignedIn(req.headers.get('authorization')))) {
    return json({ error: 'Sign in to search' }, 401);
  }

  let body: { type?: unknown; query?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Send JSON like { "type": "movie", "query": "Alien" }' }, 400);
  }

  const type = body.type as MediaType;
  if (!MEDIA_TYPES.includes(type)) return json({ error: `Unknown media type: ${body.type}` }, 400);
  if (type !== 'movie') return json({ error: `Searching for ${type} is not available yet` }, 400);

  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query) return json({ results: [] });

  let found: NewMediaItem[];
  try {
    found = unique(await deps.searchMovies(query));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 502);
  }
  if (found.length === 0) return json({ results: [] });

  const byKey = new Map((await deps.cache(found)).map((row) => [key(row), row]));
  return json({ results: found.map((m) => byKey.get(key(m))).filter(Boolean) });
}

function key(m: NewMediaItem) {
  return `${m.provider}|${m.external_id}`;
}

function unique(items: NewMediaItem[]) {
  const seen = new Set<string>();
  return items.filter((m) => !seen.has(key(m)) && !!seen.add(key(m)));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
