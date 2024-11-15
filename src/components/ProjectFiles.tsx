import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, Download, Trash2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface ProjectFilesProps {
  projectId: string;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: files, refetch } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select(`
          *,
          uploaded_by (
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${projectId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("project_files").insert({
        project_id: projectId,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        uploaded_by: session?.user.id,
      });

      if (dbError) throw dbError;

      toast({
        title: "ファイルをアップロードしました",
        description: `${file.name} のアップロードが完了しました。`,
      });

      refetch();
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルのアップロードに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("project-files")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルのダウンロードに失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!window.confirm("このファイルを削除してもよろしいですか？")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("project_files")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "ファイルを削除しました",
      });

      refetch();
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          ファイル
        </CardTitle>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isUploading}
          >
            <FileUp className="h-4 w-4 mr-2" />
            アップロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files?.map((file) => (
            <Card key={file.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{file.filename}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <span>
                        {new Date(file.created_at).toLocaleDateString("ja-JP")}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="mx-2">•</span>
                      <span>アップロード: {file.uploaded_by?.full_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.file_path, file.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id, file.file_path)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}