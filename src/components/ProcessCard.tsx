import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";
import { useQueryClient } from "@tanstack/react-query";
import { ProcessHeader } from "./ProcessHeader";
import { Progress } from "@/components/ui/progress";

interface ProcessCardProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    percentage: number;
    order_index: number;
    tasks: any[];
  };
  projectId: string;
}

export const ProcessCard = ({ process, projectId }: ProcessCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("この工程を削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("processes")
        .delete()
        .eq("id", process.id);

      if (error) throw error;

      toast({
        title: "工程を削除しました",
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "工程の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      const newStatus = checked ? "完了" : "進行中";
      const newPercentage = checked ? 100 : 0;

      const { error } = await supabase
        .from("processes")
        .update({
          status: newStatus,
          percentage: newPercentage,
        })
        .eq("id", process.id);

      if (error) throw error;

      toast({
        title: `ステータスを${newStatus}に更新しました`,
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <ProcessHeader
        process={process}
        status={process.status}
        isUpdating={isUpdating}
        projectId={projectId}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <Progress value={process.percentage} className="flex-1" />
          <span className="text-sm text-gray-500">{process.percentage}%</span>
        </div>

        {process.description && (
          <p className="text-sm text-gray-500 mb-3">{process.description}</p>
        )}

        <div className="space-y-3">
          {process.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </div>
    </div>
  );
};