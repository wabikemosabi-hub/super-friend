import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Stars } from '@/constants/encounters';
import { nomadLog, rateStop, reachedStops } from '@/lib/ratings';
import {
  addRecommendation,
  adventureRecommendations,
  cleanReasons,
  replaceRecommendation,
  splitRecommendations,
} from '@/lib/recommendations';

export function useAdventure(nomadId: string | null, type: string) {
  const client = useQueryClient();
  const key = ['adventure', nomadId];
  const picks = useQuery({
    queryKey: key,
    queryFn: () => adventureRecommendations(nomadId ?? ''),
    enabled: nomadId !== null,
  });
  const reached = useQuery({
    queryKey: ['reached', nomadId],
    queryFn: () => reachedStops(nomadId ?? ''),
    enabled: nomadId !== null,
  });
  const logKey = ['log', nomadId];
  const log = useQuery({
    queryKey: logKey,
    queryFn: () => nomadLog(nomadId ?? ''),
    enabled: nomadId !== null,
  });
  const entries = log.data ?? [];

  return {
    ...splitRecommendations(picks.data ?? [], type),
    reached: reached.data ?? [],
    log: entries.filter((entry) => entry.mine),
    reports: entries.filter((entry) => !entry.mine),
    isLoading: nomadId !== null && picks.isPending && !picks.error,
    error: picks.error ? picks.error.message : null,
    add: async (mediaItemId: string, reasons: string[]) => {
      if (nomadId === null) return;
      await addRecommendation(nomadId, mediaItemId, cleanReasons(reasons));
      await client.invalidateQueries({ queryKey: key });
    },
    replace: async (recommendationId: string, mediaItemId: string, reasons: string[]) => {
      await replaceRecommendation(recommendationId, mediaItemId, cleanReasons(reasons));
      await client.invalidateQueries({ queryKey: key });
    },
    rate: async (mediaItemId: string, stars: Stars, encounter: number, reasons: string[]) => {
      await rateStop(mediaItemId, stars, encounter, cleanReasons(reasons));
      await Promise.all([client.invalidateQueries({ queryKey: key }), client.invalidateQueries({ queryKey: logKey })]);
    },
  };
}
