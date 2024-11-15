import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDays, MoreVertical, User } from "lucide-react";
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
    <Card className="bg-white border-gray-100 hover:border-purple-100 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleStatusChange("進行中")}>
                進行中に変更
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("完了")}>
                完了に変更
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};