import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export type SessionStatus = 'loading' | 'signedOut' | 'needsProfile' | 'ready';

export type SessionState = {
  status: SessionStatus;
  session: Session | null;
  profile: Profile | null;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: 'loading',
    session: null,
    profile: null,
  });

  useEffect(() => {
    let active = true;

    async function load(session: Session | null) {
      if (!session) {
        if (active) setState({ status: 'signedOut', session: null, profile: null });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();
      const profile: Profile | null = data;

      if (!active) return;
      setState(
        profile
          ? { status: 'ready', session, profile }
          : { status: 'needsProfile', session, profile: null },
      );
    }

    supabase.auth.getSession().then(({ data }) => load(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => load(session), 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const state = useContext(SessionContext);
  if (!state) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return state;
}
