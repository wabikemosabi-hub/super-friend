import * as Linking from 'expo-linking';

import { SignInScreen } from '@/components/sign-in-screen';
import { signInWithGoogle } from '@/lib/auth';

export default function SignInRoute() {
  return <SignInScreen onContinueWithGoogle={() => signInWithGoogle(Linking.createURL('/'))} />;
}
