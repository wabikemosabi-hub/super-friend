import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchMedia, shouldSearch, type MediaType } from '@/lib/media-search';

const typingPause = 300;

export function useMediaSearch(type: MediaType, query: string) {
  const typed = query.trim();
  const settled = useSettledValue(typed, typingPause);
  const active = shouldSearch(settled);
  const waiting = shouldSearch(typed) && typed !== settled;

  const search = useQuery({
    queryKey: ['media-search', type, settled],
    queryFn: () => searchMedia(type, settled),
    enabled: active,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const isSearching = waiting || (active && search.isFetching);
  const finished = active && !isSearching && search.isSuccess && !search.isPlaceholderData;

  return {
    results: active ? (search.data ?? []) : [],
    isSearching,
    error: active && search.error ? search.error.message : null,
    noMatches: finished && search.data.length === 0,
  };
}

function useSettledValue<T>(value: T, delay: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
