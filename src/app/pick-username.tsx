import { PickUsernameScreen } from '@/components/pick-username-screen';
import { signOut } from '@/lib/auth';
import { pickAvatar, type PickedAvatar } from '@/lib/avatar';
import { usernameAvailable } from '@/lib/profile';
import { finishSignUp } from '@/lib/sign-up';
import { useSession } from '@/providers/session-provider';

export default function PickUsernameRoute() {
  const { session, refreshProfile } = useSession();

  async function submit(username: string, avatar: PickedAvatar) {
    if (!session) return 'Your sign-in ran out. Sign in again?';
    const problem = await finishSignUp(session.user.id, username, avatar);
    if (!problem) await refreshProfile();
    return problem;
  }

  return (
    <PickUsernameScreen
      checkUsername={usernameAvailable}
      onSubmit={submit}
      onSignOut={signOut}
      pickAvatar={pickAvatar}
    />
  );
}
