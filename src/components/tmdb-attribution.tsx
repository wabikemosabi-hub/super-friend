import { ThemedText } from '@/components/themed-text';

export function TmdbAttribution() {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </ThemedText>
  );
}
