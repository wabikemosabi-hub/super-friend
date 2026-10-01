import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { SessionProvider, useSession } from '@/providers/session-provider';

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

type ProfileRow = { id: string; username: string; avatar_url: string | null };

const mockAuth = {
  session: null as Session | null,
  profile: null as ProfileRow | null,
  listener: null as AuthListener | null,
  unsubscribe: jest.fn(),
  answerGetSession: true,
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () =>
        mockAuth.answerGetSession
          ? Promise.resolve({ data: { session: mockAuth.session }, error: null })
          : new Promise(() => {}),
      onAuthStateChange: (listener: AuthListener) => {
        mockAuth.listener = listener;
        return { data: { subscription: { unsubscribe: mockAuth.unsubscribe } } };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: mockAuth.profile, error: null }),
        }),
      }),
    }),
  },
}));

function fakeSession(userId: string): Session {
  return {
    access_token: 'access',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-09-30T00:00:00Z',
    },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

beforeEach(() => {
  mockAuth.session = null;
  mockAuth.profile = null;
  mockAuth.listener = null;
  mockAuth.unsubscribe.mockClear();
  mockAuth.answerGetSession = true;
});

test('is loading while Supabase is still checking for a session', async () => {
  mockAuth.answerGetSession = false;

  const { result } = await renderHook(() => useSession(), { wrapper });

  expect(result.current.status).toBe('loading');
});

test('is signed out when there is no session', async () => {
  const { result } = await renderHook(() => useSession(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('signedOut'));
});

test('needs a profile when signed in without one', async () => {
  mockAuth.session = fakeSession('eben-id');

  const { result } = await renderHook(() => useSession(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('needsProfile'));
});

test('is ready with the profile when signed in with one', async () => {
  mockAuth.session = fakeSession('eben-id');
  mockAuth.profile = { id: 'eben-id', username: 'eben', avatar_url: 'eben-id/avatar.png' };

  const { result } = await renderHook(() => useSession(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.profile?.username).toBe('eben');
});

test('goes back to signed out when the user signs out', async () => {
  mockAuth.session = fakeSession('eben-id');
  mockAuth.profile = { id: 'eben-id', username: 'eben', avatar_url: null };
  const { result } = await renderHook(() => useSession(), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('ready'));

  await act(async () => mockAuth.listener?.('SIGNED_OUT', null));

  await waitFor(() => expect(result.current.status).toBe('signedOut'));
  expect(result.current.profile).toBeNull();
});

test('stops listening when the app unmounts', async () => {
  const { unmount } = await renderHook(() => useSession(), { wrapper });

  await act(async () => unmount());

  expect(mockAuth.unsubscribe).toHaveBeenCalled();
});

test('complains when used outside the provider', async () => {
  await expect(renderHook(() => useSession())).rejects.toThrow('useSession must be used inside SessionProvider');
});
