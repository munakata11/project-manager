import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileUp } from "lucide-react";
import { FileList } from "./FileList";
import { URLList } from "./URLList";
import { CreateURLDialog } from "./CreateURLDialog";
import { useAuth } from "./AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectFilesProps {
  projectId: string;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select(`
          *,
          uploaded_by:profiles (
            full_name
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: urls, refetch: refetchUrls } = useQuery({
    queryKey: ["project-urls", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_urls")
        .select(`
          *,
          created_by:profiles (
            full_name
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

      refetchFiles();
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

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          参照
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">ファイル</TabsTrigger>
            <TabsTrigger value="urls">参考URL</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <div className="mb-4 flex justify-end">
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
            </div>
            <FileList
              files={files || []}
              projectId={projectId}
              onRefetch={refetchFiles}
            />
          </TabsContent>

          <TabsContent value="urls">
            <div className="mb-4 flex justify-end">
              <CreateURLDialog projectId={projectId} onURLAdded={refetchUrls} />
            </div>
            <URLList urls={urls || []} onRefetch={refetchUrls} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}