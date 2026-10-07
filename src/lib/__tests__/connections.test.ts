import { PostgrestError } from '@supabase/supabase-js';

import {
  type Connection,
  groupConnections,
  myConnections,
  respondToConnectionRequest,
  sendConnectionRequest,
} from '@/lib/connections';

type DatabaseResult = { data: unknown; error: PostgrestError | null };

const mockRpc = jest.fn<Promise<DatabaseResult>, [string, unknown]>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (fn: string, args: unknown) => mockRpc(fn, args),
  },
}));

function databaseError(code: string, message: string) {
  return new PostgrestError({ code, message, details: '', hint: '' });
}

beforeEach(() => {
  mockRpc.mockReset().mockResolvedValue({ data: null, error: null });
});

test('asks a nomad to connect by username', async () => {
  await sendConnectionRequest('taffy-lee-fubbins');

  expect(mockRpc).toHaveBeenCalledTimes(1);
  expect(mockRpc).toHaveBeenCalledWith('send_connection_request', { username: 'taffy-lee-fubbins' });
});

test('passes along the reason a request could not be sent', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('P0001', 'No nomad named nobody-at-all') });

  await expect(sendConnectionRequest('nobody-at-all')).rejects.toThrow('No nomad named nobody-at-all');
});

test('lists your connections', async () => {
  const rows = [
    {
      connection_id: 'connection-1',
      nomad_id: 'user-2',
      username: 'roy-donk',
      avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/user-2/avatar.jpg',
      status: 'accepted',
      outgoing: true,
    },
  ];
  mockRpc.mockResolvedValue({ data: rows, error: null });

  await expect(myConnections()).resolves.toEqual(rows);
  expect(mockRpc).toHaveBeenCalledTimes(1);
  expect(mockRpc).toHaveBeenCalledWith('my_connections', undefined);
});

test('passes along a failed connection list', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('08006', 'connection failure') });

  await expect(myConnections()).rejects.toThrow('connection failure');
});

test('accepts a request', async () => {
  await respondToConnectionRequest('connection-1', true);

  expect(mockRpc).toHaveBeenCalledTimes(1);
  expect(mockRpc).toHaveBeenCalledWith('respond_to_connection_request', {
    connection_id: 'connection-1',
    accept: true,
  });
});

test('declines a request', async () => {
  await respondToConnectionRequest('connection-1', false);

  expect(mockRpc).toHaveBeenCalledWith('respond_to_connection_request', {
    connection_id: 'connection-1',
    accept: false,
  });
});

test('passes along a failed answer', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('08006', 'connection failure') });

  await expect(respondToConnectionRequest('connection-1', true)).rejects.toThrow('connection failure');
});

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

test('groups connections into nomads, incoming requests and outgoing requests', () => {
  const taffy = connection('taffy-lee-fubbins', 'accepted', false);
  const roy = connection('roy-donk', 'pending', false);
  const bart = connection('bart-harley-jarvis', 'pending', true);

  expect(groupConnections([taffy, roy, bart])).toEqual({
    nomads: [taffy],
    incoming: [roy],
    outgoing: [bart],
  });
});

test('sorts each group by username, ignoring case', () => {
  const taffy = connection('Taffy-Lee-Fubbins', 'accepted', true);
  const roy = connection('roy-donk', 'accepted', false);
  const bart = connection('bart-harley-jarvis', 'accepted', true);

  expect(groupConnections([taffy, roy, bart]).nomads).toEqual([bart, roy, taffy]);
});
