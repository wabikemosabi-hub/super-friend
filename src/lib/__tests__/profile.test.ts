import { PostgrestError } from '@supabase/supabase-js';

import { createProfile, usernameAvailable } from '@/lib/profile';

type DatabaseResult = { error: PostgrestError | null };

const mockFrom = jest.fn<void, [string]>();
const mockInsert = jest.fn<Promise<DatabaseResult>, [unknown]>();
const mockRpc = jest.fn<Promise<DatabaseResult & { data: boolean | null }>, [string, unknown]>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      return { insert: (row: unknown) => mockInsert(row) };
    },
    rpc: (fn: string, args: unknown) => mockRpc(fn, args),
  },
}));

function databaseError(code: string, message: string) {
  return new PostgrestError({ code, message, details: '', hint: '' });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockInsert.mockReset().mockResolvedValue({ error: null });
  mockRpc.mockReset();
});

test('saves the profile', async () => {
  await createProfile({
    id: 'user-1',
    username: 'taffy-lee-fubbins',
    avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/user-1/avatar.jpg',
  });

  expect(mockFrom).toHaveBeenCalledWith('profiles');
  expect(mockInsert).toHaveBeenCalledWith({
    id: 'user-1',
    username: 'taffy-lee-fubbins',
    avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/user-1/avatar.jpg',
  });
});

test('says the username is taken', async () => {
  mockInsert.mockResolvedValue({ error: databaseError('23505', 'duplicate key value') });

  await expect(
    createProfile({ id: 'user-2', username: 'roy-donk', avatar_url: null }),
  ).rejects.toThrow('That username is taken');
});

test('passes along any other failure', async () => {
  mockInsert.mockResolvedValue({ error: databaseError('08006', 'connection failure') });

  await expect(
    createProfile({ id: 'user-2', username: 'roy-donk', avatar_url: null }),
  ).rejects.toThrow('connection failure');
});

test('asks the database whether a username is free', async () => {
  mockRpc.mockResolvedValue({ data: false, error: null });

  await expect(usernameAvailable('Roy-Donk')).resolves.toBe(false);
  expect(mockRpc).toHaveBeenCalledWith('username_available', { name: 'Roy-Donk' });
});

test('passes along a failed username check', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('08006', 'connection failure') });

  await expect(usernameAvailable('roy-donk')).rejects.toThrow('connection failure');
});
