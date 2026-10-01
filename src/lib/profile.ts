import { supabase } from '@/lib/supabase';
import type { Profile } from '@/providers/session-provider';

const uniqueViolation = '23505';

export async function createProfile(profile: Profile) {
  const { error } = await supabase.from('profiles').insert(profile);
  if (error?.code === uniqueViolation) throw new Error('That username is taken');
  if (error) throw error;
}

export async function usernameAvailable(name: string): Promise<boolean> {
  const { data } = await supabase.rpc('username_available', { name });
  return data;
}
