import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

export type SessionContextValue = SessionState & {
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

function signedInState(session: Session, profile: Profile | null): SessionState {
  return profile
    ? { status: 'ready', session, profile }
    : { status: 'needsProfile', session, profile: null };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: 'loading',
    session: null,
    profile: null,
  });

  const { session } = state;
  const refreshProfile = useCallback(async () => {
    if (!session) return;
    const profile = await fetchProfile(session.user.id);
    setState(signedInState(session, profile));
  }, [session]);

  useEffect(() => {
    let active = true;

    async function load(session: Session | null) {
      if (!session) {
        if (active) setState({ status: 'signedOut', session: null, profile: null });
        return;
      }

      const profile = await fetchProfile(session.user.id);
      if (active) setState(signedInState(session, profile));
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

  const value = useMemo(() => ({ ...state, refreshProfile }), [state, refreshProfile]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const state = useContext(SessionContext);
  if (!state) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return state;
}
