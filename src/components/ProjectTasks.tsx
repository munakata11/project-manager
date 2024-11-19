import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { SaveTaskTemplateDialog } from "@/components/SaveTaskTemplateDialog";
import { ApplyTaskTemplateDialog } from "@/components/ApplyTaskTemplateDialog";
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
  const tasks = project.tasks || [];

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-col pb-3">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            タスク
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <CreateTaskDialog projectId={project.id} />
          <SaveTaskTemplateDialog projectId={project.id} tasks={tasks} />
          <ApplyTaskTemplateDialog projectId={project.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={project.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}