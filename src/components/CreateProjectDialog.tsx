import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectFormFields, formSchema, FormData } from "./ProjectFormFields";

export const CreateProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount_excl_tax: 0,
      amount_incl_tax: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title: data.title,
          description: data.description || null,
          design_period: data.design_period.toISOString(),
          amount_excl_tax: data.amount_excl_tax,
          amount_incl_tax: data.amount_incl_tax,
          contractor_company_id: data.contractor_company_id,
          owner_id: session?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (project) {
        await supabase.from("project_members").insert({
          project_id: project.id,
          profile_id: session?.user?.id,
          role: "owner",
        });

        toast({
          title: "成功",
          description: "プロジェクトを作成しました。",
        });

        setOpen(false);
        navigate(`/project/${project.id}`);
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          新規プロジェクト
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            新規プロジェクト作成
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectFormFields form={form} />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              作成
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};