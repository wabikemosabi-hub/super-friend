import * as Linking from 'expo-linking';

import { SignInScreen } from '@/components/sign-in-screen';
import { signInWithGoogle, signInWithPassword } from '@/lib/auth';

export default function SignInRoute() {
  return (
    <SignInScreen
      onContinueWithGoogle={() => signInWithGoogle(Linking.createURL('/'))}
      onSignInWithEmail={__DEV__ ? signInWithPassword : undefined}
    />
  );
}
