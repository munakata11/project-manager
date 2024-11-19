import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingNotes } from "@/components/MeetingNotes";
import { ProjectFiles } from "@/components/ProjectFiles";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProjectTasks } from "@/components/ProjectTasks";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectNameConfirm, setProjectNameConfirm] = useState("");
  
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

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "プロジェクトを削除しました",
        description: "プロジェクト一覧に戻ります",
      });
      navigate("/");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: "プロジェクトの削除に失敗しました",
        variant: "destructive",
      });
      console.error("Error deleting project:", error);
    },
  });

  const handleDeleteProject = () => {
    if (projectNameConfirm === project?.title) {
      deleteProjectMutation.mutate();
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

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
          <p className="mt-1 text-gray-500">{project.description}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="bg-white border-red-500 text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              プロジェクトを削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>プロジェクトを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。削除を確認するには、プロジェクト名を入力してください。
                <div className="mt-4">
                  <Input
                    placeholder={project.title}
                    value={projectNameConfirm}
                    onChange={(e) => setProjectNameConfirm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectNameConfirm("")}>
                キャンセル
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={projectNameConfirm !== project.title}
              >
                削除する
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ProjectOverview project={project} />

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">工程・タスク</TabsTrigger>
          <TabsTrigger value="notes">議事録・電話メモ</TabsTrigger>
          <TabsTrigger value="reference">参照</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <ProjectTasks project={project} />
        </TabsContent>

        <TabsContent value="notes">
          <MeetingNotes projectId={project.id} />
        </TabsContent>

        <TabsContent value="reference">
          <ProjectFiles projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;