import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDays, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  };
  projectId: string;
}

export const TaskCard = ({ task, projectId }: TaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (checked: boolean) => {
    try {
      setIsLoading(true);
      const newStatus = checked ? "完了" : "進行中";
      
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
      console.error("Error updating task status:", error);
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
      console.error("Error deleting task:", error);
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
    <Card className="bg-white border-gray-100 hover:border-purple-100 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2 mt-1">
              <Checkbox
                checked={task.status === "完了"}
                onCheckedChange={handleStatusChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between gap-4">
                <h3 className={`font-medium ${task.status === "完了" ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {task.title}
                </h3>
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
              {task.description && (
                <p className={`text-sm ${task.status === "完了" ? "line-through text-gray-400" : "text-gray-500"}`}>
                  {task.description}
                </p>
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
      </CardContent>
    </Card>
  );
};