import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProjectFormFields, formSchema, FormData } from "./ProjectFormFields";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditProjectDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectDialog = ({ project, open, onOpenChange }: EditProjectDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project.title,
      description: project.description || "",
      design_period: project.design_period ? new Date(project.design_period) : new Date(),
      amount_excl_tax: project.amount_excl_tax || 0,
      amount_incl_tax: project.amount_incl_tax || 0,
      contractor_company_id: project.contractor_company_id || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: data.title,
          description: data.description || null,
          design_period: data.design_period.toISOString(),
          amount_excl_tax: data.amount_excl_tax,
          amount_incl_tax: data.amount_incl_tax,
          contractor_company_id: data.contractor_company_id,
        })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "プロジェクトを更新しました。",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            プロジェクトを編集
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectFormFields form={form} />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              更新
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};