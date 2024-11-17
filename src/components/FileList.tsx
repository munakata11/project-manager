import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2 } from "lucide-react";

interface FileListProps {
  files: {
    id: string;
    filename: string;
    file_path: string;
    created_at: string;
    size: number;
    uploaded_by: {
      full_name: string | null;
    } | null;
  }[];
  projectId: string;
  onRefetch: () => void;
}

export function FileList({ files, projectId, onRefetch }: FileListProps) {
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent, filePath: string, filename: string) => {
    e.stopPropagation();
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

  const handleOpen = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from("project-files")
        .getPublicUrl(filePath);

      window.open(data.publicUrl, '_blank');
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルを開けませんでした。",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, filePath: string) => {
    e.stopPropagation();
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

      onRefetch();
    } catch (error) {
      toast({
        title: "エラー",
        description: "ファイルの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {files?.map((file) => (
        <Card 
          key={file.id} 
          className="border-gray-100 cursor-pointer hover:border-purple-200 transition-colors"
          onClick={() => handleOpen(file.file_path)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{file.filename}</h3>
                <div className="mt-1 text-sm text-gray-500">
                  <span>
                    {new Date(file.created_at).toLocaleDateString("ja-JP")}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDownload(e, file.file_path, file.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(e, file.id, file.file_path)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}