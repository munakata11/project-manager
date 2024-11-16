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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingNotes } from "@/components/MeetingNotes";
import { ProjectFiles } from "@/components/ProjectFiles";
import { CreateProcessDialog } from "@/components/CreateProcessDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { session } = useAuth();
  const { toast } = useToast();

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
          processes (
            id,
            title,
            description,
            status,
            tasks (
              *,
              assignee:profiles (
                full_name,
                avatar_url
              )
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

  const handleProcessStatusChange = async (processId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({ status: newStatus })
        .eq("id", processId);

      if (error) throw error;

      toast({
        title: "工程のステータスを更新しました",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "工程のステータスの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

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

  const otherTasks = project.tasks?.filter(task => !task.process_id) || [];

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

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">タスク</TabsTrigger>
          <TabsTrigger value="notes">議事録・電話メモ</TabsTrigger>
          <TabsTrigger value="files">ファイル</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
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
                <CreateProcessDialog projectId={project.id} />
                <CreateTaskDialog projectId={project.id} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {project.processes?.map((process) => (
                  <div key={process.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={process.status === "完了"}
                        onCheckedChange={(checked) => {
                          handleProcessStatusChange(process.id, checked ? "完了" : "進行中");
                        }}
                      />
                      <h3 className="text-lg font-medium text-gray-900">{process.title}</h3>
                    </div>
                    {process.description && (
                      <p className="text-sm text-gray-500">{process.description}</p>
                    )}
                    <div className="space-y-3">
                      {process.tasks?.map((task) => (
                        <TaskCard key={task.id} task={task} projectId={project.id} />
                      ))}
                    </div>
                  </div>
                ))}
                {otherTasks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">その他のタスク</h3>
                    {otherTasks.map((task) => (
                      <TaskCard key={task.id} task={task} projectId={project.id} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <MeetingNotes projectId={project.id} />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFiles projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;