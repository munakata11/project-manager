import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { ProjectMembersDialog } from "@/components/ProjectMembersDialog";
import { CreateProcessDialog } from "@/components/CreateProcessDialog";
import { ProcessCard } from "@/components/ProcessCard";
import { TaskCard } from "@/components/TaskCard";

interface ProjectTasksProps {
  project: {
    id: string;
    processes: any[];
    tasks: any[];
    project_members: any[];  // 追加：project_membersプロパティを型定義に追加
  };
}

export function ProjectTasks({ project }: ProjectTasksProps) {
  const otherTasks = project.tasks?.filter(task => !task.process_id) || [];

  return (
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
            <ProcessCard
              key={process.id}
              process={process}
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
        </div>
      </CardContent>
    </Card>
  );
}