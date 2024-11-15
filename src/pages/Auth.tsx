import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-600">ワークフロー</h2>
          <p className="mt-2 text-sm text-gray-600">
            プロジェクト管理をシンプルに
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7C3AED',
                    brandAccent: '#6D28D9',
                  },
                },
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: 'ログイン',
                  loading_button_label: '読み込み中...',
                  email_input_placeholder: 'メールアドレスを入力',
                  password_input_placeholder: 'パスワードを入力',
                },
                sign_up: {
                  email_label: 'メールアドレス',
                  password_label: 'パスワード',
                  button_label: '新規登録',
                  loading_button_label: '読み込み中...',
                  email_input_placeholder: 'メールアドレスを入力',
                  password_input_placeholder: 'パスワードを入力',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;