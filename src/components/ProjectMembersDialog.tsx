import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type FormData = {
  email: string;
};

interface ProjectMembersDialogProps {
  projectId: string;
  currentMembers: Array<{
    profile_id: string;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
}

export const ProjectMembersDialog = ({
  projectId,
  currentMembers,
}: ProjectMembersDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      // メールアドレスからユーザープロファイルを検索
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("email", data.email)
        .single();

      if (profileError) throw new Error("ユーザーが見つかりません");

      // すでにメンバーかチェック
      const isMember = currentMembers.some(
        (member) => member.profile_id === profiles.id
      );
      if (isMember) throw new Error("すでにプロジェクトのメンバーです");

      // メンバーを追加
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        profile_id: profiles.id,
      });

      if (error) throw error;

      toast({
        title: "メンバーを追加しました",
        description: `${profiles.full_name}さんをプロジェクトに追加しました。`,
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "メンバーの追加に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Users className="w-4 h-4 mr-2" />
          メンバー管理
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            プロジェクトメンバーの管理
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              現在のメンバー
            </h4>
            <div className="space-y-2">
              {currentMembers.map((member) => (
                <div
                  key={member.profile_id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">
                    {member.profiles.full_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      メールアドレス
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="招待するメンバーのメールアドレス"
                        className="border-gray-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                メンバーを追加
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};