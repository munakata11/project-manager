import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, ExternalLink } from "lucide-react";

interface Attachment {
  id: string;
  filename: string;
  file_path: string;
  created_at: string;
}

interface NoteAttachmentsProps {
  noteId: string;
  attachments: Attachment[];
}

export function NoteAttachments({ noteId, attachments }: NoteAttachmentsProps) {
  const { toast } = useToast();

  const handleDownload = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("meeting-attachments")
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
        .from("meeting-attachments")
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

  return (
    <div className="mt-4">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-3 mb-2 border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{attachment.filename}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpen(attachment.file_path)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment.file_path, attachment.filename)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}