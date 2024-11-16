import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

type FormData = {
  title: string;
  description: string;
  due_date: string;
  process_id?: string;
};

interface CreateTaskDialogProps {
  projectId: string;
}

export const CreateTaskDialog = ({ projectId }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>();

  const { data: processes } = useQuery({
    queryKey: ["processes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processes")
        .select("id, title")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .insert({
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          project_id: projectId,
          process_id: data.process_id || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully.",
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          タスク追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">タスクの追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="タスクのタイトルを入力" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">説明</FormLabel>
                  <FormControl>
                    <Textarea placeholder="タスクの説明を入力" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">期限</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="process_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">工程</FormLabel>
                  <FormControl>
                    <select
                      className="w-full border border-gray-200 rounded-md px-3 py-2"
                      {...field}
                    >
                      <option value="">工程を選択</option>
                      {processes?.map((process) => (
                        <option key={process.id} value={process.id}>
                          {process.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              作成
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
