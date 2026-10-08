import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Recommendation =
  Database['public']['Functions']['adventure_recommendations']['Returns'][number];

export const MAX_PICKS = 3;

const MAX_REASONS = 3;
const MAX_REASON_LENGTH = 140;

export async function addRecommendation(nomadId: string, mediaItemId: string, reasons: string[]) {
  const { data, error } = await supabase.rpc('add_recommendation', {
    nomad_id: nomadId,
    media_item_id: mediaItemId,
    reasons,
  });
  if (error) throw error;
  return data;
}

export async function adventureRecommendations(nomadId: string) {
  const { data, error } = await supabase.rpc('adventure_recommendations', { nomad_id: nomadId });
  if (error) throw error;
  return data;
}

export function cleanReasons(reasons: string[]) {
  return reasons.map((reason) => reason.trim()).filter((reason) => reason !== '');
}

export function reasonsProblem(reasons: string[]) {
  const cleaned = cleanReasons(reasons);
  if (cleaned.length < 1 || cleaned.length > MAX_REASONS) return 'Give 1 to 3 reasons';
  if (cleaned.some((reason) => reason.length > MAX_REASON_LENGTH)) {
    return 'Keep each reason under 140 characters';
  }
  return null;
}

export function splitRecommendations(recommendations: Recommendation[], type: string) {
  const ofType = recommendations.filter((r) => r.type === type).sort((a, b) => a.rank - b.rank);

  return {
    fromThem: ofType.filter((r) => !r.outgoing),
    toThem: ofType.filter((r) => r.outgoing),
  };
}

export function openSlots(list: Recommendation[]) {
  return Math.max(0, MAX_PICKS - list.length);
}
