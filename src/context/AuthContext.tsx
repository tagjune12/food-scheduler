import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@lib/api/supabase_api';
import { getOAuthErrorFromUrl, removeOAuthErrorParams } from '@lib/util';

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

  useEffect(() => {
    // Google 동의 취소 등으로 로그인이 실패하면 Supabase가 ?error=...(또는 #error=...)를 붙여 돌려보낸다.
    // 이 오류는 onAuthStateChange로 오지 않고 URL에도 그대로 남으므로 여기서 알리고 정리한다
    const oauthError = getOAuthErrorFromUrl(window.location.href);
    if (oauthError === null) {
      return;
    }
    console.error('OAuth redirect error:', oauthError);
    window.history.replaceState(
      window.history.state,
      '',
      removeOAuthErrorParams(window.location.href),
    );
    alert('로그인에 실패했습니다. 다시 시도해 주세요.');
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        throw error;
      }
    } catch (error) {
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
