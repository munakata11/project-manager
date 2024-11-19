import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  percentage: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

interface EditProcessDialogProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    percentage: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const EditProcessDialog = ({ process, open, onOpenChange, projectId }: EditProcessDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: process.title,
      description: process.description || "",
      percentage: process.percentage ?? 20,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({
          title: data.title,
          description: data.description || null,
          percentage: data.percentage,
        })
        .eq("id", process.id);

      if (error) throw error;

      toast({
        title: "工程を更新しました",
      });

      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "工程の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">工程の編集</DialogTitle>
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
              更新
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};