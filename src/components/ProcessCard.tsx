import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";
import { useQueryClient } from "@tanstack/react-query";
import { ProcessHeader } from "./ProcessHeader";
import { ProcessDependencyDialog } from "./ProcessDependencyDialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ProcessCardProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    percentage: number;
    order_index: number;
    duration_days: number;
    tasks: any[];
  };
  processes: Array<{
    id: string;
    title: string;
  }>;
  projectId: string;
}

export const ProcessCard = ({ process, processes, projectId }: ProcessCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [durationDays, setDurationDays] = useState(process.duration_days);

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

      const { error } = await supabase
        .from("processes")
        .update({
          status: newStatus,
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

  const updateDurationDays = async () => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({
          duration_days: durationDays,
        })
        .eq("id", process.id);

      if (error) throw error;

      toast({
        title: "所要日数を更新しました",
      });

      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "所要日数の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <ProcessHeader
        process={process}
        status={process.status}
        isUpdating={isUpdating}
        projectId={projectId}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <div className="mt-4 space-y-4">
        {process.description && (
          <p className="text-sm text-gray-500">{process.description}</p>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">所要日数:</span>
            <Input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="w-20 h-8"
            />
            <Button size="sm" onClick={updateDurationDays} className="h-8">
              更新
            </Button>
          </div>
          <ProcessDependencyDialog
            process={process}
            processes={processes}
            projectId={projectId}
          />
        </div>

        <div className="space-y-3">
          {process.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </div>
    </div>
  );
};