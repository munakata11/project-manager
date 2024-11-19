import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDays, ChevronDown, ChevronRight, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CreateSubTaskDialog } from "./CreateSubTaskDialog";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    due_date: string | null;
    assignee?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    subtasks?: TaskCardProps["task"][];
  };
  projectId: string;
  level?: number;
}

export const TaskCard = ({ task, projectId, level = 0 }: TaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "ステータスを更新しました",
        description: `タスク「${task.title}」のステータスを${newStatus}に変更しました。`,
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("このタスクを削除してもよろしいですか？")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) throw error;

      toast({
        title: "タスクを削除しました",
        description: `タスク「${task.title}」を削除しました。`,
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-white border-gray-100 hover:border-purple-100 transition-colors ${level > 0 ? 'ml-8' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2 mt-1">
              <Checkbox
                checked={task.status === "完了"}
                onCheckedChange={(checked) => {
                  handleStatusChange(checked ? "完了" : "進行中");
                }}
                disabled={isLoading}
              />
              {task.subtasks && task.subtasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-4 hover:bg-transparent"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <div className="flex items-center gap-2">
                  <CreateSubTaskDialog projectId={projectId} parentTaskId={task.id} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="h-7 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-gray-500">{task.description}</p>
              )}
              <div className="flex items-center gap-4">
                {task.due_date && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>
                      期限: {new Date(task.due_date).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{task.assignee.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {isExpanded && task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-4 space-y-3">
            {task.subtasks.map((subtask) => (
              <TaskCard
                key={subtask.id}
                task={subtask}
                projectId={projectId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};