import { BasecampScreen } from '@/components/basecamp-screen';
import { signOut } from '@/lib/auth';
import { useSession } from '@/providers/session-provider';

export default function BasecampRoute() {
  const { profile } = useSession();

  return <BasecampScreen username={profile?.username ?? ''} onSignOut={signOut} />;
}
