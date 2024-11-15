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

interface CreateNoteDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: "meeting" | "call";
  title: string;
}

export function CreateNoteDialog({
  projectId,
  open,
  onOpenChange,
  noteType,
  title,
}: CreateNoteDialogProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !content) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from("meeting_notes").insert({
        project_id: projectId,
        title: noteTitle,
        content,
        note_type: noteType,
        created_by: session?.user.id,
      });

      if (error) throw error;

      toast({
        title: noteType === "meeting" ? "議事録を作成しました" : "電話メモを作成しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes", projectId] });
      onOpenChange(false);
      setNoteTitle("");
      setContent("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="タイトル"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
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