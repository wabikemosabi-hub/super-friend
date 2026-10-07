import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  groupConnections,
  myConnections,
  respondToConnectionRequest,
  sendConnectionRequest,
} from '@/lib/connections';

const connectionsKey = ['connections'];

export function useConnections() {
  const client = useQueryClient();
  const list = useQuery({ queryKey: connectionsKey, queryFn: myConnections });
  const refresh = () => client.invalidateQueries({ queryKey: connectionsKey });

  return {
    ...groupConnections(list.data ?? []),
    isLoading: list.isPending && !list.error,
    error: list.error ? list.error.message : null,
    send: async (username: string) => {
      await sendConnectionRequest(username);
      await refresh();
    },
    respond: async (connectionId: string, accept: boolean) => {
      await respondToConnectionRequest(connectionId, accept);
      await refresh();
    },
  };
}
