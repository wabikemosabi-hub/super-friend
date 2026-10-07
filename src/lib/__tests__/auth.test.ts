import { signInWithGoogle, signInWithPassword, signOut } from '@/lib/auth';

type AuthResult = { error: Error | null };

const mockSignInWithOAuth = jest.fn<Promise<AuthResult & { data: object }>, [unknown]>();
const mockSignInWithPassword = jest.fn<Promise<AuthResult & { data: object }>, [unknown]>();
const mockSignOut = jest.fn<Promise<AuthResult>, []>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (options: unknown) => mockSignInWithOAuth(options),
      signInWithPassword: (credentials: unknown) => mockSignInWithPassword(credentials),
      signOut: () => mockSignOut(),
    },
  },
}));

beforeEach(() => {
  mockSignInWithOAuth.mockReset().mockResolvedValue({ data: {}, error: null });
  mockSignInWithPassword.mockReset().mockResolvedValue({ data: {}, error: null });
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

test('signs in with an email and password', async () => {
  await signInWithPassword('paul-bufano@dev.local', 'nomad-password');

  expect(mockSignInWithPassword).toHaveBeenCalledWith({
    email: 'paul-bufano@dev.local',
    password: 'nomad-password',
  });
});

test('reports a failed email sign-in', async () => {
  mockSignInWithPassword.mockResolvedValue({ data: {}, error: new Error('Invalid login credentials') });

  await expect(signInWithPassword('paul-bufano@dev.local', 'wrong')).rejects.toThrow(
    'Invalid login credentials',
  );
});

test('signs out', async () => {
  await signOut();

  expect(mockSignOut).toHaveBeenCalledTimes(1);
});

test('reports a failed sign out', async () => {
  mockSignOut.mockResolvedValue({ error: new Error('offline') });

  await expect(signOut()).rejects.toThrow('offline');
});
