import { router, useLocalSearchParams } from 'expo-router';

import { AdventureScreen } from '@/components/adventure-screen';
import { useAdventure } from '@/hooks/use-adventure';
import { useConnections } from '@/hooks/use-connections';
import { findNomad } from '@/lib/connections';
import { signOut } from '@/lib/auth';
import { useSession } from '@/providers/session-provider';

export default function AdventureRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { profile } = useSession();
  const { nomads, isLoading } = useConnections();
  const nomad = findNomad(nomads, username ?? '');
  const { fromThem, toThem, isLoading: picksLoading, error, add, replace } = useAdventure(nomad?.nomad_id ?? null, 'movie');

  return (
    <AdventureScreen
      username={profile?.username ?? ''}
      avatarUrl={profile?.avatar_url ?? null}
      nomad={nomad}
      isLoading={isLoading}
      fromThem={fromThem}
      toThem={toThem}
      picksLoading={picksLoading}
      picksError={error}
      onAdd={add}
      onReplace={replace}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onSignOut={signOut}
    />
  );
}
