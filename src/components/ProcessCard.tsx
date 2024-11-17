import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskCard } from "./TaskCard";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";

interface ProcessCardProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    percentage: number;
    tasks: any[];
  };
  projectId: string;
}

export const ProcessCard = ({ process, projectId }: ProcessCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      percentage: process.percentage || 0,
    },
  });

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
        .update({ status: checked ? "完了" : "進行中" })
        .eq("id", process.id);

      if (error) throw error;

      // Update project progress
      const { data: processes } = await supabase
        .from("processes")
        .select("percentage, status")
        .eq("project_id", projectId);

      if (processes) {
        const totalProgress = processes.reduce((acc, curr) => {
          return acc + (curr.status === "完了" ? curr.percentage : 0);
        }, 0);

        await supabase
          .from("projects")
          .update({ progress: totalProgress })
          .eq("id", projectId);
      }

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

  const handlePercentageUpdate = async (data: { percentage: number }) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({ percentage: data.percentage })
        .eq("id", process.id);

      if (error) throw error;

      toast({
        title: "進捗率を更新しました",
      });

      setIsEditOpen(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={process.status === "完了"}
            onCheckedChange={handleStatusChange}
            disabled={isUpdating}
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{process.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">進捗割合: {process.percentage}%</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit2 className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          </div>
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>進捗率の編集</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePercentageUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>進捗率 ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">更新</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};