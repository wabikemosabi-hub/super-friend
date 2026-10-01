import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchMedia, shouldSearch, type MediaType } from '@/lib/media-search';

const typingPause = 300;

export function useMediaSearch(type: MediaType, query: string) {
  const settled = useSettledValue(query.trim(), typingPause);
  const active = shouldSearch(settled);

  const search = useQuery({
    queryKey: ['media-search', type, settled],
    queryFn: () => searchMedia(type, settled),
    enabled: active,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  return {
    results: active ? (search.data ?? []) : [],
    isSearching: active && search.isFetching,
    error: active && search.error ? search.error.message : null,
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
