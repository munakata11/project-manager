import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Building2 } from "lucide-react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          tasks (
            id
          ),
          contractor_companies!left (
            name
          )
        `)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">プロジェクト一覧</h1>
          <p className="mt-1 text-sm text-gray-500">進行中のプロジェクトをダッシュボードで管理します</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card 
            key={project.id} 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border-gray-100"
            onClick={() => navigate(`/project/${project.id}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">{project.title}</CardTitle>
              <CardDescription className="text-sm text-gray-500 line-clamp-2">{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                    <div>
                      <span>受注会社：</span>
                      <span>{project.contractor_companies?.name || "未設定"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
                    <div>
                      <span>設計工期：</span>
                      <span>{project.design_period 
                        ? new Date(project.design_period).toLocaleDateString('ja-JP') 
                        : "未設定"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end text-sm text-gray-500">
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;