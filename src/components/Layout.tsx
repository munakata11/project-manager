import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-purple-600">
            Project Manager
          </h1>
        </div>

        <nav className="space-y-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors",
              location.pathname === "/" &&
                "bg-purple-50 text-purple-600 font-medium"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            ダッシュボード
          </Link>

          <div className="mt-4 space-y-1">
            {projects?.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className={cn(
                  "block px-3 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-sm",
                  location.pathname === `/project/${project.id}` &&
                    "bg-purple-50 text-purple-600 font-medium"
                )}
              >
                {project.title}
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-purple-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            ログアウト
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-auto bg-gray-50 p-6 max-w-[1300px] mx-auto">
        {children}
      </main>
    </div>
  );
}