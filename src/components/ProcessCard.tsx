import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";
import { useQueryClient } from "@tanstack/react-query";
import { ProcessHeader } from "./ProcessHeader";

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
      const { error } = await supabase
        .from("processes")
        .update({ 
          status: checked ? "完了" : "進行中",
          percentage: checked ? process.percentage : process.percentage
        })
        .eq("id", process.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータスの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePercentageChange = async (value: number) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({ 
          percentage: value,
          status: value === 100 ? "完了" : "進行中",
          order_index: process.order_index // 順序を維持
        })
        .eq("id", process.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "進捗率の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <ProcessHeader
        title={process.title}
        percentage={process.percentage}
        status={process.status}
        isUpdating={isUpdating}
        onStatusChange={handleStatusChange}
        onPercentageChange={handlePercentageChange}
        onDelete={handleDelete}
      />

      {process.description && (
        <p className="text-sm text-gray-500">{process.description}</p>
      )}

      <div className="space-y-3">
        {process.tasks?.map((task) => (
          <TaskCard key={task.id} task={task} projectId={projectId} />
        ))}
      </div>
    </div>
  );
};