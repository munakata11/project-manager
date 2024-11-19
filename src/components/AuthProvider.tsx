import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInAnonymously: async () => {},
  isAnonymous: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_anonymous')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        setIsAnonymous(data?.is_anonymous || false);
      } catch (error) {
        console.error('Profile error:', error);
      }
      setLoading(false);
    };

    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setIsAnonymous(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInAnonymously = async () => {
    try {
      const uniqueId = crypto.randomUUID();
      const { error } = await supabase.auth.signUp({
        email: `${uniqueId}@example.com`,
        password: uniqueId,
        options: {
          data: {
            full_name: `匿名ユーザー_${uniqueId.slice(0, 8)}`,
            is_anonymous: true,
          },
        },
      });
      
      if (error) {
        console.error('匿名ログインエラー:', error);
        toast({
          title: "エラー",
          description: error.message === "Email address cannot be used as it is not authorized" 
            ? "現在システムメンテナンス中です。しばらくしてから再度お試しください。"
            : "匿名ログインに失敗しました。",
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

  return (
    <AuthContext.Provider 
      value={{
        session,
        loading,
        signInAnonymously,
        isAnonymous,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}