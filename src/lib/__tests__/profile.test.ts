import { PostgrestError } from '@supabase/supabase-js';

import { createProfile } from '@/lib/profile';

const mockFrom = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      return { insert: (row: unknown) => mockInsert(row) };
    },
  },
}));

function databaseError(code: string, message: string) {
  return new PostgrestError({ code, message, details: '', hint: '' });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockInsert.mockReset().mockResolvedValue({ error: null });
});

test('saves the profile', async () => {
  await createProfile({
    id: 'user-1',
    username: 'taffy_lee_fubbins',
    avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/user-1/avatar.jpg',
  });

  expect(mockFrom).toHaveBeenCalledWith('profiles');
  expect(mockInsert).toHaveBeenCalledWith({
    id: 'user-1',
    username: 'taffy_lee_fubbins',
    avatar_url: 'http://127.0.0.1:54321/storage/v1/object/public/avatars/user-1/avatar.jpg',
  });
});

test('says the username is taken', async () => {
  mockInsert.mockResolvedValue({ error: databaseError('23505', 'duplicate key value') });

  await expect(
    createProfile({ id: 'user-2', username: 'roy_donk', avatar_url: null }),
  ).rejects.toThrow('That username is taken');
});

test('passes along any other failure', async () => {
  mockInsert.mockResolvedValue({ error: databaseError('08006', 'connection failure') });

  await expect(
    createProfile({ id: 'user-2', username: 'roy_donk', avatar_url: null }),
  ).rejects.toThrow('connection failure');
});
