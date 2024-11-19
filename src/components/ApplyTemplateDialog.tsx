import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApplyTemplateDialogProps {
  projectId: string;
}

export const ApplyTemplateDialog = ({ projectId }: ApplyTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ["process-templates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_templates")
        .select(`
          id,
          title,
          description,
          process_template_items (
            id,
            title,
            description,
            order_index
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const applyTemplate = async (templateId: string) => {
    try {
      const { data: items } = await supabase
        .from("process_template_items")
        .select("*")
        .eq("template_id", templateId)
        .order("order_index", { ascending: true });

      if (!items) return;

      const processes = items.map((item) => ({
        project_id: projectId,
        title: item.title,
        description: item.description,
        order_index: item.order_index,
        template_id: templateId,
      }));

      const { error } = await supabase
        .from("processes")
        .insert(processes);

      if (error) throw error;

      toast({
        title: "テンプレートを適用しました",
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "テンプレートの適用に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          テンプレートから作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">テンプレートを選択</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:border-purple-200 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{template.title}</h3>
                {template.description && (
                  <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                )}
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700">工程一覧:</h4>
                  <ul className="mt-2 space-y-1">
                    {template.process_template_items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600">
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => applyTemplate(template.id)}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  このテンプレートを適用
                </Button>
              </div>
            ))}
            {templates?.length === 0 && (
              <p className="text-center text-gray-500">
                テンプレートがありません。現在の工程をテンプレート化してください。
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};