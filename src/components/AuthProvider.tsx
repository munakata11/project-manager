import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInAnonymously: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      // 一意のメールアドレスとパスワードを生成
      const uniqueId = crypto.randomUUID();
      const { error } = await supabase.auth.signUp({
        email: `anonymous.${uniqueId}@gmail.com`,
        password: uniqueId,
        options: {
          data: {
            full_name: `匿名ユーザー_${uniqueId.slice(0, 8)}`,
          },
        },
      });
      
      if (error) {
        toast({
          title: "エラー",
          description: "匿名ログインに失敗しました",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "匿名ログインしました",
      });
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  };

  const value = {
    session,
    loading,
    signInAnonymously,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}