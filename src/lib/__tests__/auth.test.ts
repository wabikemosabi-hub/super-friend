import { signInWithGoogle, signOut } from '@/lib/auth';

type AuthResult = { error: Error | null };

const mockSignInWithOAuth = jest.fn<Promise<AuthResult & { data: object }>, [unknown]>();
const mockSignOut = jest.fn<Promise<AuthResult>, []>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (options: unknown) => mockSignInWithOAuth(options),
      signOut: () => mockSignOut(),
    },
  },
}));

beforeEach(() => {
  mockSignInWithOAuth.mockReset().mockResolvedValue({ data: {}, error: null });
  mockSignOut.mockReset().mockResolvedValue({ error: null });
});

test('signs in with Google and comes back to this page', async () => {
  await signInWithGoogle('http://localhost:8081');

  expect(mockSignInWithOAuth).toHaveBeenCalledWith({
    provider: 'google',
    options: { redirectTo: 'http://localhost:8081' },
  });
});

test('reports a failed Google sign-in', async () => {
  mockSignInWithOAuth.mockResolvedValue({ data: {}, error: new Error('Google said no') });

  await expect(signInWithGoogle('http://localhost:8081')).rejects.toThrow('Google said no');
});

test('signs out', async () => {
  await signOut();

  expect(mockSignOut).toHaveBeenCalledTimes(1);
});

test('reports a failed sign out', async () => {
  mockSignOut.mockResolvedValue({ error: new Error('offline') });

  await expect(signOut()).rejects.toThrow('offline');
});
