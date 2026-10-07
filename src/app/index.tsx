import { BasecampScreen } from '@/components/basecamp-screen';
import { useConnections } from '@/hooks/use-connections';
import { signOut } from '@/lib/auth';
import { useSession } from '@/providers/session-provider';

export default function BasecampRoute() {
  const { profile } = useSession();
  const { nomads, incoming, outgoing, isLoading, error, send, respond } = useConnections();

  return (
    <BasecampScreen
      username={profile?.username ?? ''}
      avatarUrl={profile?.avatar_url ?? null}
      onSignOut={signOut}
      nomads={nomads}
      incoming={incoming}
      outgoing={outgoing}
      isLoading={isLoading}
      error={error}
      onSend={send}
      onRespond={respond}
    />
  );
}
