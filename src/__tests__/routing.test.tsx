import type { ReactNode } from 'react';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { SessionState } from '@/providers/session-provider';

const mockSession: { state: SessionState } = {
  state: { status: 'loading', session: null, profile: null },
};

jest.mock('@/providers/session-provider', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
  useSession: () => mockSession.state,
}));

jest.mock('@/lib/auth', () => ({
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@/lib/avatar', () => ({
  pickAvatar: jest.fn(),
}));

jest.mock('@/lib/sign-up', () => ({
  finishSignUp: jest.fn(),
}));

jest.mock('@/lib/profile', () => ({
  createProfile: jest.fn(),
  usernameAvailable: jest.fn(),
}));

const taffy = { id: 'taffy-id', username: 'taffy-lee-fubbins', avatar_url: null };

test('shows nothing while the session is loading', async () => {
  mockSession.state = { status: 'loading', session: null, profile: null };

  await renderRouter('src/app');

  expect(screen.queryByTestId('sign-in-google')).toBeNull();
  expect(screen.queryByTestId('basecamp-greeting')).toBeNull();
});

test('sends signed-out visitors to sign in', async () => {
  mockSession.state = { status: 'signedOut', session: null, profile: null };

  await renderRouter('src/app');

  expect(screen.getByTestId('sign-in-google')).toBeOnTheScreen();
});

test('keeps signed-out visitors out of Basecamp even if they ask for it', async () => {
  mockSession.state = { status: 'signedOut', session: null, profile: null };

  await renderRouter('src/app', { initialUrl: '/' });

  expect(screen.queryByTestId('basecamp-greeting')).toBeNull();
  expect(screen.getByTestId('sign-in-google')).toBeOnTheScreen();
});

test('sends signed-in nomads without a profile to pick a username', async () => {
  mockSession.state = { status: 'needsProfile', session: null, profile: null };

  await renderRouter('src/app');

  expect(screen.getByTestId('pick-username-sign-out')).toBeOnTheScreen();
});

test('sends nomads with a profile to Basecamp', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };

  await renderRouter('src/app');

  expect(screen.getByTestId('basecamp-greeting')).toHaveTextContent('Welcome to Basecamp, taffy-lee-fubbins');
});
