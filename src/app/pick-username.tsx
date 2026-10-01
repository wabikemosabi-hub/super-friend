import { PickUsernameScreen } from '@/components/pick-username-screen';
import { signOut } from '@/lib/auth';

export default function PickUsernameRoute() {
  return <PickUsernameScreen onSignOut={signOut} />;
}
