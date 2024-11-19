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
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
});

interface SaveTaskTemplateDialogProps {
  projectId: string;
  tasks: Array<{
    title: string;
    description: string | null;
  }>;
}

export const SaveTaskTemplateDialog = ({ projectId, tasks }: SaveTaskTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const { data: template, error: templateError } = await supabase
        .from("task_templates")
        .insert({
          title: data.title,
          description: data.description || null,
          project_id: projectId,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      const templateItems = tasks.map((task, index) => ({
        template_id: template.id,
        title: task.title,
        description: task.description,
        order_index: index,
      }));

      const { error: itemsError } = await supabase
        .from("task_template_items")
        .insert(templateItems);

      if (itemsError) throw itemsError;

      toast({
        title: "テンプレートを作成しました",
        description: "タスク一覧をテンプレートとして保存しました",
      });

      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["task-templates", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "テンプレートの作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          テンプレートとして保存
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">タスク一覧をテンプレート化</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-500 mb-4">
          このタスク一覧をテンプレートとして保存すると、他のプロジェクトでも同じタスク一覧を簡単に作成できます。
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">タイトル *</FormLabel>
                  <FormControl>
                    <Input placeholder="テンプレートのタイトルを入力" className="border-gray-200" {...field} />
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
                    <Textarea placeholder="テンプレートの説明を入力" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              保存
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};