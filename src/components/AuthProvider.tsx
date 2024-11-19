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

  const checkIsAnonymous = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_anonymous')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.is_anonymous || false;
    } catch (error) {
      console.error('Error in checkIsAnonymous:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!mounted) return;

        if (initialSession?.user) {
          const isAnon = await checkIsAnonymous(initialSession.user.id);
          if (mounted) {
            setSession(initialSession);
            setIsAnonymous(isAnon);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;

        if (currentSession?.user) {
          const isAnon = await checkIsAnonymous(currentSession.user.id);
          if (mounted) {
            setSession(currentSession);
            setIsAnonymous(isAnon);
          }
        } else {
          if (mounted) {
            setSession(null);
            setIsAnonymous(false);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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