import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  percentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

interface CreateProcessDialogProps {
  projectId: string;
}

export const CreateProcessDialog = ({ projectId }: CreateProcessDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      percentage: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("processes")
        .insert({
          title: data.title,
          description: data.description || null,
          project_id: projectId,
          percentage: data.percentage,
        });

      if (error) throw error;

      toast({
        title: "工程を作成しました",
      });

      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "工程の作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          工程追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">工程の追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">タイトル *</FormLabel>
                  <FormControl>
                    <Input placeholder="工程のタイトルを入力" className="border-gray-200" {...field} />
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
                    <Textarea placeholder="工程の説明を入力" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">進捗割合 ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
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