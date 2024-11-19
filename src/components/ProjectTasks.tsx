import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { CreateProcessDialog } from "@/components/CreateProcessDialog";
import { ProcessCard } from "@/components/ProcessCard";
import { TaskCard } from "@/components/TaskCard";
import { CreateProcessTemplateDialog } from "./CreateProcessTemplateDialog";
import { ApplyTemplateDialog } from "./ApplyTemplateDialog";
import { ProcessMermaidChart } from "./ProcessMermaidChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectTasksProps {
  project: {
    id: string;
    processes: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string | null;
      percentage: number;
      order_index: number;
      duration_days: number;
      tasks: any[];
    }>;
    tasks: any[];
  };
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  const otherTasks = project.tasks?.filter(task => !task.process_id && !task.parent_task_id) || [];
  
  const sortedProcesses = [...(project.processes || [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  const { data: dependencies } = useQuery({
    queryKey: ["process-dependencies", project.id],
    queryFn: async () => {
      const processIds = sortedProcesses.map(p => p.id);
      const { data, error } = await supabase
        .from("process_dependencies")
        .select("*")
        .in("process_id", processIds);

      if (error) throw error;
      return data || [];
    },
  });

  const processesWithDependencies = sortedProcesses.map(process => ({
    ...process,
    dependencies: dependencies?.filter(d => d.process_id === process.id),
  }));

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          工程・タスク
        </CardTitle>
        <div className="flex gap-2">
          <CreateProcessTemplateDialog projectId={project.id} processes={sortedProcesses} />
          <ApplyTemplateDialog projectId={project.id} />
          <CreateProcessDialog projectId={project.id} />
          <CreateTaskDialog projectId={project.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedProcesses.map((process) => (
            <ProcessCard
              key={process.id}
              process={process}
              processes={sortedProcesses}
              projectId={project.id}
            />
          ))}
          {otherTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">その他のタスク</h3>
              {otherTasks.map((task) => (
                <TaskCard key={task.id} task={task} projectId={project.id} />
              ))}
            </div>
          )}
          
          {processesWithDependencies.length > 0 && (
            <ProcessMermaidChart processes={processesWithDependencies} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}