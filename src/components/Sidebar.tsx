import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

export function Sidebar() {
  const location = useLocation();
  const { session } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ["sidebar-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .eq("owner_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0
  });

  return (
    <div className="hidden lg:flex h-screen w-80 flex-col fixed left-0 top-0 border-r bg-white">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-purple-600">Project Manager</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === "/"
              ? "bg-purple-50 text-purple-600"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          ダッシュボード
        </Link>

        {projects && projects.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              プロジェクト
            </h3>
            <div className="mt-2 space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === `/project/${project.id}`
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {project.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}