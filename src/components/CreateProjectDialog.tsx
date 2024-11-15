import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Plus } from "lucide-react";

type FormData = {
  title: string;
  description: string;
};

export const CreateProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title: data.title,
          description: data.description,
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
          title: "Success",
          description: "Project created successfully.",
        });

        setOpen(false);
        navigate(`/project/${project.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" className="border-gray-200" {...field} />
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
                  <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" className="border-gray-200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Create Project
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};