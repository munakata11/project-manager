import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskCard } from "@/components/TaskCard";

interface ProjectTasksProps {
  project: {
    id: string;
    tasks: any[];
  };
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  const otherTasks = project.tasks?.filter(task => !task.parent_task_id) || [];

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
          {otherTasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={project.id} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}