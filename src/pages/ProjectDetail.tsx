import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, List, Users } from "lucide-react";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { ProjectMembersDialog } from "@/components/ProjectMembersDialog";
import { TaskCard } from "@/components/TaskCard";
import { Checkbox } from "@/components/ui/checkbox";

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

      if (data.tasks && data.tasks.length > 0) {
        const completedTasks = data.tasks.filter(
          (task) => task.status === "完了"
        ).length;
        const progress = Math.round(
          (completedTasks / data.tasks.length) * 100
        );
        
        await supabase
          .from("projects")
          .update({ progress })
          .eq("id", projectId);
        
        data.progress = progress;
      }

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
          <h1 className="text-2xl font-semibold text-gray-900">
            プロジェクトが見つかりません
          </h1>
          <p className="text-gray-500">
            お探しのプロジェクトは存在しません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
        <p className="mt-1 text-gray-500">{project.description}</p>
      </div>

      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            概要
          </CardTitle>
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
              <span>
                作成日: {new Date(project.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{project.project_members?.length || 0} メンバー</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            タスク
          </CardTitle>
          <div className="flex gap-2">
            <ProjectMembersDialog
              projectId={project.id}
              currentMembers={project.project_members || []}
            />
            <CreateTaskDialog projectId={project.id} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.tasks?.map((task) => (
              <TaskCard key={task.id} task={task} projectId={project.id} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;