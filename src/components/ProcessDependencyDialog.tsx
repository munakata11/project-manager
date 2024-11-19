import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  depends_on_id: z.string().min(1, "依存する工程を選択してください"),
  duration_days: z.number().min(1, "1日以上を指定してください"),
});

type FormData = z.infer<typeof formSchema>;

interface ProcessDependencyDialogProps {
  process: {
    id: string;
    title: string;
  };
  processes: Array<{
    id: string;
    title: string;
  }>;
  projectId: string;
}

export const ProcessDependencyDialog = ({ process, processes, projectId }: ProcessDependencyDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration_days: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("process_dependencies")
        .insert({
          process_id: process.id,
          depends_on_id: data.depends_on_id,
          duration_days: data.duration_days,
        });

      if (error) throw error;

      toast({
        title: "依存関係を追加しました",
      });

      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "依存関係の追加に失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 自分自身と既に依存関係にある工程を除外
  const availableProcesses = processes.filter(p => p.id !== process.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7">
          依存関係を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">依存関係の追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="depends_on_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">依存する工程</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="工程を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProcesses.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">所要日数</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      className="border-gray-200"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              追加
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};