import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@lib/api/supabase_api';

interface AuthContextType {
  session: Session | null;
  userId: string;
  isLogin: boolean;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    // 구독 직후 INITIAL_SESSION 이벤트가 저장된 세션(또는 OAuth code 교환 결과)과 함께 한 번 온다
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error('Error in signInWithGoogle:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  const signOut = async () => {
    // 이전 동작(이 브라우저만 로그아웃)을 유지한다. 기본값 'global'은 모든 기기의 세션을 끊는다
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error('Error in signOut:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        userId: session?.user.id ?? '',
        isLogin: session !== null,
        isAuthLoading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
