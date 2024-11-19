import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectTasksProps {
  project: {
    id: string;
    tasks: any[];
  };
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  const queryClient = useQueryClient();
  const mainTasks = project.tasks?.filter(task => !task.parent_task_id) || [];

  useEffect(() => {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${project.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project", project.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, queryClient]);

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          タスク
        </CardTitle>
        <div className="flex gap-2">
          <CreateTaskDialog projectId={project.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mainTasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={project.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}