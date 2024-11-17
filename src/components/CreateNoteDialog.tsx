import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";

interface CreateNoteDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: "meeting" | "call";
  title: string;
  noteCount: number;
}

export function CreateNoteDialog({
  projectId,
  open,
  onOpenChange,
  noteType,
  title,
  noteCount,
}: CreateNoteDialogProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useAITitle, setUseAITitle] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const generateTitle = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { content }
      });

      if (error) throw error;
      return data.title;
    } catch (error) {
      console.error("Error generating title:", error);
      throw error;
    }
  };

  const uploadFile = async (file: File, noteId: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${noteId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("meeting-attachments")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from("meeting_note_attachments")
      .insert({
        note_id: noteId,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        uploaded_by: session?.user.id,
      });

    if (dbError) throw dbError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || (!noteTitle && !useAITitle)) return;

    try {
      setIsLoading(true);
      let finalTitle = noteTitle;

      if (useAITitle) {
        try {
          finalTitle = await generateTitle(content);
        } catch (error) {
          toast({
            title: "エラー",
            description: "タイトルの生成に失敗しました。",
            variant: "destructive",
          });
          return;
        }
      }

      const formattedTitle = `${noteType === "meeting" ? "議事録" : "電話メモ"}#${noteCount + 1} ${finalTitle}`;

      const { data: noteData, error } = await supabase
        .from("meeting_notes")
        .insert({
          project_id: projectId,
          title: formattedTitle,
          content,
          note_type: noteType,
          created_by: session?.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments
      if (files.length > 0) {
        for (const file of files) {
          await uploadFile(file, noteData.id);
        }
      }

      toast({
        title: noteType === "meeting" ? "議事録を作成しました" : "電話メモを作成しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes", projectId] });
      onOpenChange(false);
      setNoteTitle("");
      setContent("");
      setUseAITitle(true);
      setFiles([]);
    } catch (error) {
      toast({
        title: "エラー",
        description: noteType === "meeting" ? "議事録の作成に失敗しました。" : "電話メモの作成に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Input
                placeholder="タイトル"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required={!useAITitle}
                disabled={useAITitle}
                className="flex-1 mr-2"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useAI"
                  checked={useAITitle}
                  onCheckedChange={(checked) => setUseAITitle(checked as boolean)}
                />
                <Label htmlFor="useAI" className="text-sm">AI生成</Label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[200px]"
            />
          </div>
          {noteType === "meeting" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  multiple
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center space-x-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                >
                  <FileUp className="h-4 w-4" />
                  <span>添付ファイル追加</span>
                </Label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              作成
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}