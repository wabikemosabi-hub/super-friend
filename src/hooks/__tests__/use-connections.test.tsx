import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useConnections } from '@/hooks/use-connections';
import type { Connection } from '@/lib/connections';

const mockMyConnections = jest.fn<Promise<Connection[]>, []>();
const mockSendConnectionRequest = jest.fn<Promise<void>, [string]>();
const mockRespondToConnectionRequest = jest.fn<Promise<void>, [string, boolean]>();

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/connections', () => ({
  ...jest.requireActual<typeof import('@/lib/connections')>('@/lib/connections'),
  myConnections: () => mockMyConnections(),
  sendConnectionRequest: (username: string) => mockSendConnectionRequest(username),
  respondToConnectionRequest: (id: string, accept: boolean) => mockRespondToConnectionRequest(id, accept),
}));

function connection(username: string, status: string, outgoing: boolean): Connection {
  return {
    connection_id: `connection-${username}`,
    nomad_id: `user-${username}`,
    username,
    avatar_url: '',
    status,
    outgoing,
  };
}

const taffy = connection('taffy-lee-fubbins', 'accepted', false);
const roy = connection('roy-donk', 'pending', false);

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useConnections(), { wrapper });
}

beforeEach(() => {
  mockMyConnections.mockReset().mockResolvedValue([taffy, roy]);
  mockSendConnectionRequest.mockReset().mockResolvedValue();
  mockRespondToConnectionRequest.mockReset().mockResolvedValue();
});

test('is loading until the list arrives', async () => {
  const { result } = await setup();

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
});

test('groups your connections', async () => {
  const { result } = await setup();

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.nomads).toEqual([taffy]);
  expect(result.current.incoming).toEqual([roy]);
  expect(result.current.outgoing).toEqual([]);
  expect(result.current.error).toBeNull();
});

test('reports a list that would not load', async () => {
  mockMyConnections.mockRejectedValue(new Error('connection failure'));
  const { result } = await setup();

  await waitFor(() => expect(result.current.error).toBe('connection failure'));
  expect(result.current.nomads).toEqual([]);
});

test('sends a request, then refreshes the list', async () => {
  const { result } = await setup();
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(() => result.current.send('roy-donk'));

  expect(mockSendConnectionRequest).toHaveBeenCalledWith('roy-donk');
  await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
});

test('passes along a request that could not be sent', async () => {
  mockSendConnectionRequest.mockRejectedValue(new Error('No nomad named nobody-at-all'));
  const { result } = await setup();
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await expect(result.current.send('nobody-at-all')).rejects.toThrow('No nomad named nobody-at-all');
});

test('answers a request, then refreshes the list', async () => {
  const { result } = await setup();
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(() => result.current.respond('connection-roy-donk', true));

  expect(mockRespondToConnectionRequest).toHaveBeenCalledWith('connection-roy-donk', true);
  await waitFor(() => expect(mockMyConnections).toHaveBeenCalledTimes(2));
});
