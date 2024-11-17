import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileListProps {
  projectId: string;
}

interface ProjectFile {
  id: string;
  filename: string;
  content_type: string | null;
  size: number | null;
  created_at: string;
}

export function FileList({ projectId }: FileListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectFile[];
    },
  });

  const handleDelete = async (fileId: string, filePath: string) => {
    if (!window.confirm("このファイルを削除してもよろしいですか？")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("project_files")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      toast({
        title: "ファイルを削除しました",
      });

      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files?.map((file) => (
        <Card key={file.id} className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{file.filename}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(file.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file.id, file.filename)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}