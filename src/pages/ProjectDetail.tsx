import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, List, User, Users } from "lucide-react";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { session } = useAuth();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_members (
            profile_id,
            profiles (
              full_name,
              avatar_url
            )
          ),
          tasks (
            *,
            assignee:profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">プロジェクトが見つかりません</h1>
          <p className="text-gray-500">お探しのプロジェクトは存在しません。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
        <p className="mt-1 text-gray-500">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-white border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-1.5">
                  <span>進捗</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2 bg-gray-100" />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>作成日: {new Date(project.created_at).toLocaleDateString('ja-JP')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{project.project_members?.length || 0} メンバー</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">タスク</CardTitle>
            <CreateTaskDialog projectId={project.id} />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.tasks?.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      {task.due_date && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          期限: {new Date(task.due_date).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{task.assignee.full_name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;