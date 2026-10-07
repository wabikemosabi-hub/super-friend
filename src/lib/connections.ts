import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Connection = Database['public']['Functions']['my_connections']['Returns'][number];

export type ConnectionGroups = {
  nomads: Connection[];
  incoming: Connection[];
  outgoing: Connection[];
};

export function groupConnections(connections: Connection[]): ConnectionGroups {
  const sorted = [...connections].sort((a, b) =>
    a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }),
  );
  const pending = sorted.filter((c) => c.status === 'pending');

  return {
    nomads: sorted.filter((c) => c.status === 'accepted'),
    incoming: pending.filter((c) => !c.outgoing),
    outgoing: pending.filter((c) => c.outgoing),
  };
}

export async function sendConnectionRequest(username: string) {
  const { error } = await supabase.rpc('send_connection_request', { username });
  if (error) throw error;
}

export async function myConnections() {
  const { data, error } = await supabase.rpc('my_connections');
  if (error) throw error;
  return data;
}

export async function respondToConnectionRequest(connectionId: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_to_connection_request', {
    connection_id: connectionId,
    accept,
  });
  if (error) throw error;
}
