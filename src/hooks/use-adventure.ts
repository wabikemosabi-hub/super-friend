import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addRecommendation,
  adventureRecommendations,
  cleanReasons,
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

  return {
    ...splitRecommendations(picks.data ?? [], type),
    isLoading: nomadId !== null && picks.isPending && !picks.error,
    error: picks.error ? picks.error.message : null,
    add: async (mediaItemId: string, reasons: string[]) => {
      if (nomadId === null) return;
      await addRecommendation(nomadId, mediaItemId, cleanReasons(reasons));
      await client.invalidateQueries({ queryKey: key });
    },
  };
}
