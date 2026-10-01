import { createClient } from 'jsr:@supabase/supabase-js@2';

import type { MediaItem } from '../_shared/media.ts';
import { handleMediaSearch } from './handler.ts';
import { searchTmdbMovies } from './providers/tmdb-movies.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve((req) =>
  handleMediaSearch(req, {
    isSignedIn: async (authorization) => {
      if (!authorization) return false;
      const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
      const { data } = await caller.auth.getUser();
      return !!data.user;
    },
    searchMovies: (query) => {
      const token = Deno.env.get('TMDB_API_TOKEN');
      if (!token) return Promise.reject(new Error('TMDB_API_TOKEN is not set'));
      return searchTmdbMovies(query, token);
    },
    cache: async (items) => {
      const fetchedAt = new Date().toISOString();
      const { data, error } = await admin
        .from('media_items')
        .upsert(items.map((m) => ({ ...m, fetched_at: fetchedAt })), { onConflict: 'provider,external_id' })
        .select();
      if (error) throw error;
      return data as MediaItem[];
    },
  })
);
