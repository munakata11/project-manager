import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";

interface ProcessCardProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    tasks: any[];
  };
  projectId: string;
  onStatusChange: (processId: string, newStatus: string) => Promise<void>;
}

export const ProcessCard = ({ process, projectId, onStatusChange }: ProcessCardProps) => {
  const { toast } = useToast();

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

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast({
        title: "エラー",
        description: "工程の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={process.status === "完了"}
            onCheckedChange={(checked) => {
              onStatusChange(process.id, checked ? "完了" : "進行中");
            }}
          />
          <h3 className="text-lg font-medium text-gray-900">{process.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
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