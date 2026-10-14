import type { ReactNode } from 'react';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { signOut } from '@/lib/auth';
import type { Recommendation } from '@/lib/recommendations';
import type { SessionState } from '@/providers/session-provider';


const mockSession: { state: SessionState } = {
  state: { status: 'loading', session: null, profile: null },
};

jest.mock('@/providers/session-provider', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
  useSession: () => mockSession.state,
}));

jest.mock('@/hooks/use-app-fonts', () => ({
  useAppFonts: () => true,
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

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

jest.mock('@/lib/scan-line', () => ({
  scanLineOn: () => true,
  rememberScanLine: jest.fn(),
}));

jest.mock('@/lib/connections', () => ({
  ...jest.requireActual<typeof import('@/lib/connections')>('@/lib/connections'),
  myConnections: () =>
    Promise.resolve([
      {
        connection_id: 'connection-roy',
        nomad_id: 'roy-id',
        username: 'roy-donk',
        avatar_url: null,
        status: 'accepted',
        outgoing: false,
      },
    ]),
}));

const mockPicks: { rows: Recommendation[] } = { rows: [] };

jest.mock('@/lib/recommendations', () => ({
  ...jest.requireActual<typeof import('@/lib/recommendations')>('@/lib/recommendations'),
  adventureRecommendations: () => Promise.resolve(mockPicks.rows),
}));

function pick(title: string, outgoing: boolean): Recommendation {
  return {
    id: `${title}-id`,
    outgoing,
    rank: 1,
    reasons: [`Watch ${title}`],
    media_item_id: `${title}-media`,
    type: 'movie',
    external_id: `movie:${title}`,
    title,
    year: 2019,
    metadata: {},
  };
}

afterEach(() => {
  mockPicks.rows = [];
});

const taffy = { id: 'taffy-id', username: 'taffy-lee-fubbins', avatar_url: null };

test('shows nothing while the session is loading', async () => {
  mockSession.state = { status: 'loading', session: null, profile: null };

  await renderRouter('src/app');

  expect(screen.queryByTestId('sign-in-google')).toBeNull();
  expect(screen.queryByTestId('account-operator')).toBeNull();
});

test('sends signed-out visitors to sign in', async () => {
  mockSession.state = { status: 'signedOut', session: null, profile: null };

  await renderRouter('src/app');

  expect(screen.getByTestId('sign-in-google')).toBeOnTheScreen();
});

test('keeps signed-out visitors out of Basecamp even if they ask for it', async () => {
  mockSession.state = { status: 'signedOut', session: null, profile: null };

  await renderRouter('src/app', { initialUrl: '/' });

  expect(screen.queryByTestId('account-operator')).toBeNull();
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

  expect(screen.getByTestId('account-operator')).toHaveTextContent('OPERATOR: TAFFY-LEE-FUBBINS');
});

test('opens the adventure page with a fellow nomad', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };

  await renderRouter('src/app', { initialUrl: '/adventure/roy-donk' });

  expect(await screen.findByTestId('adventure-nomad')).toHaveTextContent('@roy-donk · Fellow Nomad');
});

test("shows the road a fellow nomad plotted and your route for them", async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };
  mockPicks.rows = [pick('Coffin Flop', false), pick('Hot Dog Car', true)];

  await renderRouter('src/app', { initialUrl: '/adventure/roy-donk' });

  expect(await screen.findByTestId('road-stop-movie:Coffin Flop')).toHaveTextContent(/Coffin Flop \(2019\)/);
  expect(screen.queryByTestId('console-stop-movie:Hot Dog Car')).toBeNull();

  await fireEvent.press(screen.getByTestId('adventure-view-console'));

  expect(await screen.findByTestId('console-stop-movie:Hot Dog Car')).toHaveTextContent(/Hot Dog Car \(2019\)/);
  expect(screen.getByTestId('console-slots')).toHaveTextContent('2 SLOTS OPEN. MAKE THEM COUNT.');
  expect(screen.queryByTestId('road-stop-movie:Coffin Flop')).toBeNull();
});

test('shows no signal for someone who is not a fellow nomad', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };

  await renderRouter('src/app', { initialUrl: '/adventure/karl-havoc' });

  expect(await screen.findByTestId('adventure-not-found')).toBeOnTheScreen();
  expect(screen.queryByTestId('adventure-nomad')).toBeNull();
});

test('keeps signed-out visitors off adventure pages', async () => {
  mockSession.state = { status: 'signedOut', session: null, profile: null };

  await renderRouter('src/app', { initialUrl: '/adventure/roy-donk' });

  expect(screen.queryByTestId('adventure-nomad')).toBeNull();
  expect(screen.getByTestId('sign-in-google')).toBeOnTheScreen();
});

test('tapping a fellow nomad on Basecamp opens your adventure with them', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };

  const router = renderRouter('src/app');
  await router;
  await fireEvent.press(await screen.findByTestId('fellow-nomad-roy-donk'));

  expect(await screen.findByTestId('adventure-nomad')).toHaveTextContent('@roy-donk · Fellow Nomad');
  expect(router.getPathname()).toBe('/adventure/roy-donk');
});

test('signs out from your avatar on Basecamp', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };
  jest.mocked(signOut).mockClear();

  await renderRouter('src/app');
  await fireEvent.press(screen.getByTestId('account-button'));
  await fireEvent.press(screen.getByTestId('account-sign-out'));

  expect(signOut).toHaveBeenCalledTimes(1);
});

test('signs out from your avatar on an adventure page', async () => {
  mockSession.state = { status: 'ready', session: null, profile: taffy };
  jest.mocked(signOut).mockClear();

  await renderRouter('src/app', { initialUrl: '/adventure/roy-donk' });
  expect(await screen.findByTestId('account-operator')).toHaveTextContent('OPERATOR: TAFFY-LEE-FUBBINS');
  await fireEvent.press(screen.getByTestId('account-button'));
  await fireEvent.press(screen.getByTestId('account-sign-out'));

  expect(signOut).toHaveBeenCalledTimes(1);
});
