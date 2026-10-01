import { PickUsernameScreen } from '@/components/pick-username-screen';
import { signOut } from '@/lib/auth';
import { usernameAvailable } from '@/lib/profile';

export default function PickUsernameRoute() {
  return (
    <PickUsernameScreen
      checkUsername={usernameAvailable}
      onSubmit={async () => null}
      onSignOut={signOut}
      pickAvatar={async () => null}
    />
  );
}
