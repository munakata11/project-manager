import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: false,
  signInAnonymously: async () => {},
  isAnonymous: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 常にログイン済みとして扱う
  const mockSession = {
    user: {
      id: "system",
      email: "system@example.com",
    },
  } as Session;

  return (
    <AuthContext.Provider 
      value={{
        session: mockSession,
        loading: false,
        signInAnonymously: async () => {},
        isAnonymous: false,
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