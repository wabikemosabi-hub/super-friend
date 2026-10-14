import type { Stars } from '@/constants/encounters';
import type { Database } from '@/lib/database.types';
import { encounterFor, STARS } from '@/lib/encounters';
import { onRoute, type Recommendation } from '@/lib/recommendations';
import { supabase } from '@/lib/supabase';

export type ReachedStop = Database['public']['Functions']['reached_stops']['Returns'][number];

export function isStars(value: number): value is Stars {
  return STARS.some((stars) => stars === value);
}

export async function rateStop(
  mediaItemId: string,
  stars: Stars,
  encounter: number,
  reasons: string[],
  watchedOn: string,
) {
  const { data, error } = await supabase.rpc('rate_stop', {
    media_item_id: mediaItemId,
    stars,
    encounter,
    reasons,
    watched_on: watchedOn,
  });
  if (error) throw error;
  return data;
}

export async function reachedStops(nomadId: string) {
  const { data, error } = await supabase.rpc('reached_stops', { nomad_id: nomadId });
  if (error) throw error;
  return data;
}

export function reachedStop(stops: ReachedStop[], externalId: string) {
  return stops.find((stop) => stop.external_id === externalId) ?? null;
}

export function reachedNote(nomadName: string, stop: ReachedStop) {
  const note = `${nomadName.toUpperCase()} ALREADY REACHED THIS`;
  if (!isStars(stop.stars)) return note;
  return `${note}: ${encounterFor(stop.stars, stop.encounter).title.toUpperCase()}`;
}

export function blockedStop(externalId: string, route: Recommendation[], reached: ReachedStop[], nomadName: string) {
  if (onRoute(route, externalId)) {
    return { note: 'ALREADY ON YOUR ROUTE', testID: `plot-stop-unavailable-${externalId}` };
  }
  const stop = reachedStop(reached, externalId);
  if (stop) return { note: reachedNote(nomadName, stop), testID: `plot-stop-reached-${externalId}` };
  return null;
}
