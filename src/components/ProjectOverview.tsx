import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectOverviewProps {
  project: {
    id: string;
    title: string;
    description: string;
    progress: number;
    created_at: string;
  };
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      progress: project.progress || 0,
    },
  });

  const handleProgressUpdate = async (data: { progress: number }) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ progress: data.progress })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "進捗率を更新しました",
      });

      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "進捗率の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleProgressChange = (value: number) => {
    form.setValue("progress", value);
  };

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          概要
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-1.5">
              <div className="flex items-center gap-2">
                <span>進捗</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit2 className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
              <span>{project.progress || 0}%</span>
            </div>
            <Progress value={project.progress || 0} className="h-2 bg-gray-100" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>
              作成日: {new Date(project.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>進捗率の編集</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProgressUpdate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>進捗率 ({field.value}%)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => handleProgressChange(value[0])}
                            className="mb-2"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleProgressChange(Math.max(0, field.value - 10))}
                            >
                              -10%
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => handleProgressChange(Number(e.target.value))}
                              className="w-20"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleProgressChange(Math.min(100, field.value + 10))}
                            >
                              +10%
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">更新</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}