import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingNotes } from "@/components/MeetingNotes";
import { ProjectFiles } from "@/components/ProjectFiles";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProjectTasks } from "@/components/ProjectTasks";
import { ProjectHeader } from "@/components/ProjectHeader";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          contractor_companies (
            name
          ),
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
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

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
      <ProjectHeader
        title={project.title}
        description={project.description}
        onDelete={() => deleteProjectMutation.mutate()}
        onEdit={() => setIsEditDialogOpen(true)}
      />

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

      <EditProjectDialog
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}

export default ProjectDetail;